from flask import Blueprint, request, jsonify, redirect, current_app
from urllib.parse import urlencode
import requests
from models import db, Player, Session
from services.auth_service import AuthService
from datetime import datetime


bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.route('/steam/login', methods=['GET'])
def steam_login():
    """Начать Steam OpenID авторизацию"""
    return_url = request.args.get('return_url', request.host_url)
    realm = request.host_url
    
    params = {
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': f'{realm}api/auth/steam/callback?return_url={return_url}',
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
        player_data = requests.get(
            f'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={api_key}&steamids={steam_id}'
        ).json()
        
        username = player_data.get('response', {}).get('players', [{}])[0].get('personaname', f'Player{steam_id[-4:]}')
        avatar_url = player_data.get('response', {}).get('players', [{}])[0].get('avatarfull')
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
def discord_link():
    """Начать привязку Discord OAuth"""
    client_id = current_app.config.get('DISCORD_CLIENT_ID')
    if not client_id:
        return jsonify({'success': False, 'error': 'Discord не настроен'}), 503
    
    redirect_uri = f'{request.host_url}api/auth/discord/callback'
    return_url = request.args.get('return_url', request.host_url)
    
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'identify',
        'state': return_url
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
    return_url = request.args.get('state', '/')
    
    if not code:
        return redirect(f'{return_url}?error=discord_auth_failed')
    
    client_id = current_app.config.get('DISCORD_CLIENT_ID')
    client_secret = current_app.config.get('DISCORD_CLIENT_SECRET')
    redirect_uri = f'{request.host_url}api/auth/discord/callback'
    
    token_response = requests.post(
        'https://discord.com/api/oauth2/token',
        data={
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri
        },
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    ).json()
    
    access_token = token_response.get('access_token')
    if not access_token:
        return redirect(f'{return_url}?error=discord_token_failed')
    
    user_response = requests.get(
        'https://discord.com/api/users/@me',
        headers={'Authorization': f'Bearer {access_token}'}
    ).json()
    
    discord_id = user_response.get('id')
    if not discord_id:
        return redirect(f'{return_url}?error=discord_user_failed')
    
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        player_id = AuthService.verify_access_token(token)
        
        if player_id:
            player = Player.query.filter_by(id=player_id).first()
            if player:
                player.discord_id = discord_id
                db.session.commit()
    
    return redirect(f'{return_url}?discord_linked=true')


@bp.route('/refresh', methods=['POST'])
def refresh():
    """Обновить access токен"""
    data = request.get_json()
    refresh_token = data.get('refreshToken')
    
    if not refresh_token:
        return jsonify({'success': False, 'error': 'Refresh token обязателен'}), 400
    
    access_token, new_refresh_token = AuthService.refresh_tokens(refresh_token)
    
    if not access_token:
        return jsonify({'success': False, 'error': 'Неверный или истёкший refresh token'}), 401
    
    return jsonify({
        'success': True,
        'accessToken': access_token,
        'refreshToken': refresh_token
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
def get_current_user():
    """Получить текущего пользователя"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'error': 'Требуется аутентификация'}), 401
    
    token = auth_header.split(' ')[1]
    player_id = AuthService.verify_access_token(token)
    
    if not player_id:
        return jsonify({'success': False, 'error': 'Неверный токен'}), 401
    
    player = Player.query.filter_by(id=player_id).first()
    if not player:
        return jsonify({'success': False, 'error': 'Игрок не найден'}), 404
    
    return jsonify({
        'success': True,
        'player': player.to_dict()
    })
