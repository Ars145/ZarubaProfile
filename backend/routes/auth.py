from flask import Blueprint, request, jsonify, redirect, current_app
from urllib.parse import urlencode, urlparse
import requests
import os
from models import db, Player, Session, OAuthState
from services.auth_service import AuthService, require_auth
from datetime import datetime


bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def get_base_url():
    """Получить базовый URL приложения (учитывает Replit окружение)"""
    # В Replit используем REPLIT_DEV_DOMAIN
    replit_domain = os.getenv('REPLIT_DEV_DOMAIN')
    if replit_domain:
        return f'https://{replit_domain}'
    
    # Иначе используем request.host_url
    return request.host_url.rstrip('/')


def is_safe_url(target):
    """Проверка безопасности redirect URL (защита от open redirect)"""
    if not target:
        return False
    
    base_url = get_base_url()
    ref_url = urlparse(base_url)
    test_url = urlparse(target)
    
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc


@bp.route('/steam/login', methods=['GET'])
def steam_login():
    """Начать Steam OpenID авторизацию"""
    base_url = get_base_url()
    return_url = request.args.get('return_url', base_url)
    
    if not is_safe_url(return_url):
        return_url = base_url
    
    realm = base_url
    
    params = {
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': f'{realm}/api/auth/steam/callback?return_url={return_url}',
        'openid.realm': realm,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    }
    
    steam_openid_url = 'https://steamcommunity.com/openid/login?' + urlencode(params)
    
    return jsonify({
        'success': True,
        'authUrl': steam_openid_url
    })


@bp.route('/steam/callback', methods=['GET'])
def steam_callback():
    """Callback после Steam авторизации"""
    return_url = request.args.get('return_url', '/')
    
    if not is_safe_url(return_url):
        return_url = '/'
    
    params = request.args.to_dict()
    params['openid.mode'] = 'check_authentication'
    
    response = requests.post('https://steamcommunity.com/openid/login', data=params)
    
    if 'is_valid:true' not in response.text:
        return redirect(f'{return_url}?error=steam_auth_failed')
    
    claimed_id = request.args.get('openid.claimed_id', '')
    steam_id = claimed_id.split('/')[-1]
    
    if not steam_id.isdigit():
        return redirect(f'{return_url}?error=invalid_steam_id')
    
    api_key = current_app.config.get('STEAM_API_KEY')
    if api_key:
        try:
            player_data = requests.get(
                f'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={api_key}&steamids={steam_id}',
                timeout=5
            ).json()
            
            username = player_data.get('response', {}).get('players', [{}])[0].get('personaname', f'Player{steam_id[-4:]}')
            avatar_url = player_data.get('response', {}).get('players', [{}])[0].get('avatarfull')
        except:
            username = f'Player{steam_id[-4:]}'
            avatar_url = None
    else:
        username = f'Player{steam_id[-4:]}'
        avatar_url = None
    
    player = Player.query.filter_by(steam_id=steam_id).first()
    
    if not player:
        player = Player(
            steam_id=steam_id,
            username=username,
            avatar_url=avatar_url
        )
        db.session.add(player)
    else:
        player.username = username
        if avatar_url:
            player.avatar_url = avatar_url
        player.last_login = datetime.utcnow()
    
    db.session.commit()
    
    access_token, refresh_token = AuthService.generate_tokens(player.id)
    
    AuthService.create_session(
        player_id=player.id,
        refresh_token=refresh_token,
        user_agent=request.headers.get('User-Agent'),
        ip_address=request.remote_addr
    )
    
    return redirect(f'{return_url}?access_token={access_token}&refresh_token={refresh_token}')


@bp.route('/discord/link', methods=['GET'])
@require_auth
def discord_link():
    """Начать привязку Discord OAuth (требует авторизации)"""
    client_id = current_app.config.get('DISCORD_CLIENT_ID')
    if not client_id:
        return jsonify({'success': False, 'error': 'Discord не настроен'}), 503
    
    base_url = get_base_url()
    return_url = request.args.get('return_url', base_url)
    
    if not is_safe_url(return_url):
        return_url = base_url
    
    oauth_state = OAuthState.create(
        player_id=request.current_player.id,
        provider='discord',
        return_url=return_url
    )
    db.session.add(oauth_state)
    db.session.commit()
    
    redirect_uri = f'{base_url}/api/auth/discord/callback'
    
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'identify',
        'state': oauth_state.state
    }
    
    discord_auth_url = 'https://discord.com/api/oauth2/authorize?' + urlencode(params)
    
    return jsonify({
        'success': True,
        'authUrl': discord_auth_url
    })


@bp.route('/discord/callback', methods=['GET'])
def discord_callback():
    """Callback после Discord OAuth"""
    code = request.args.get('code')
    state = request.args.get('state')
    
    if not code or not state:
        return redirect('/?error=discord_auth_failed')
    
    OAuthState.cleanup_expired()
    
    oauth_state = OAuthState.query.filter_by(state=state, provider='discord').first()
    
    if not oauth_state or oauth_state.is_expired:
        return redirect('/?error=discord_state_invalid')
    
    return_url = oauth_state.return_url
    player_id = oauth_state.player_id
    
    db.session.delete(oauth_state)
    db.session.commit()
    
    base_url = get_base_url()
    client_id = current_app.config.get('DISCORD_CLIENT_ID')
    client_secret = current_app.config.get('DISCORD_CLIENT_SECRET')
    redirect_uri = f'{base_url}/api/auth/discord/callback'
    
    try:
        token_response = requests.post(
            'https://discord.com/api/oauth2/token',
            data={
                'client_id': client_id,
                'client_secret': client_secret,
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': redirect_uri
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=5
        ).json()
        
        access_token = token_response.get('access_token')
        if not access_token:
            return redirect(f'{return_url}?error=discord_token_failed')
        
        user_response = requests.get(
            'https://discord.com/api/users/@me',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=5
        ).json()
        
        discord_id = user_response.get('id')
        discord_username = user_response.get('username')
        
        if not discord_id:
            return redirect(f'{return_url}?error=discord_user_failed')
        
        player = Player.query.filter_by(id=player_id).first()
        if player:
            player.discord_id = discord_id
            player.discord_username = discord_username
            db.session.commit()
        
        return redirect(f'{return_url}?discord_linked=true')
        
    except Exception as e:
        return redirect(f'{return_url}?error=discord_request_failed')


@bp.route('/discord/unlink', methods=['POST'])
@require_auth
def discord_unlink():
    """Отвязать Discord аккаунт"""
    player = request.current_player
    
    player.discord_id = None
    player.discord_username = None
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Discord аккаунт успешно отвязан'
    })


@bp.route('/refresh', methods=['POST'])
def refresh():
    """Обновить access токен и ротировать refresh токен"""
    data = request.get_json()
    old_refresh_token = data.get('refreshToken')
    
    if not old_refresh_token:
        return jsonify({'success': False, 'error': 'Refresh token обязателен'}), 400
    
    result = AuthService.refresh_tokens(
        old_refresh_token,
        user_agent=request.headers.get('User-Agent'),
        ip_address=request.remote_addr
    )
    
    if not result:
        return jsonify({'success': False, 'error': 'Неверный или истёкший refresh token'}), 401
    
    access_token, new_refresh_token = result
    
    return jsonify({
        'success': True,
        'accessToken': access_token,
        'refreshToken': new_refresh_token
    })


@bp.route('/logout', methods=['POST'])
def logout():
    """Выход из системы"""
    data = request.get_json()
    refresh_token = data.get('refreshToken')
    
    if refresh_token:
        AuthService.revoke_session(refresh_token)
    
    return jsonify({'success': True})


@bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    """Получить текущего пользователя"""
    player_dict = request.current_player.to_dict()
    
    # Проверка является ли пользователь админом
    admin_steam_ids = current_app.config.get('ADMIN_STEAM_IDS', [])
    player_dict['isAdmin'] = request.current_player.steam_id in admin_steam_ids
    
    return jsonify({
        'success': True,
        'player': player_dict
    })
