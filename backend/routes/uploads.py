from flask import Blueprint, request, jsonify
from services.auth_service import require_auth
from services.file_service import FileService
from models import db


bp = Blueprint('uploads', __name__, url_prefix='/api/uploads')


@bp.route('/avatar', methods=['POST'])
@require_auth
def upload_avatar():
    """Загрузить аватар игрока"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'Файл не предоставлен'}), 400
    
    file = request.files['file']
    
    old_avatar = request.current_player.avatar_url
    
    url, error = FileService.process_and_save(file, 'avatar')
    
    if error:
        return jsonify({'success': False, 'error': error}), 400
    
    if old_avatar:
        FileService.delete_file(old_avatar)
    
    request.current_player.avatar_url = url
    db.session.commit()
    
    return jsonify({
        'success': True,
        'avatarUrl': url
    })


@bp.route('/clan-logo', methods=['POST'])
@require_auth
def upload_clan_logo():
    """Загрузить логотип клана"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'Файл не предоставлен'}), 400
    
    file = request.files['file']
    clan_id = request.form.get('clanId')
    
    if not clan_id:
        return jsonify({'success': False, 'error': 'ID клана обязателен'}), 400
    
    from models import Clan
    clan = Clan.query.filter_by(id=clan_id).first()
    
    if not clan:
        return jsonify({'success': False, 'error': 'Клан не найден'}), 404
    
    from models import ClanMember
    member = ClanMember.query.filter_by(
        clan_id=clan_id,
        player_id=request.current_player.id
    ).first()
    
    if not member or member.role != 'owner':
        return jsonify({'success': False, 'error': 'Только владелец может загружать логотип'}), 403
    
    old_logo = clan.logo_url
    
    url, error = FileService.process_and_save(file, 'clan_logo')
    
    if error:
        return jsonify({'success': False, 'error': error}), 400
    
    if old_logo:
        FileService.delete_file(old_logo)
    
    clan.logo_url = url
    db.session.commit()
    
    return jsonify({
        'success': True,
        'logoUrl': url
    })


@bp.route('/clan-banner', methods=['POST'])
@require_auth
def upload_clan_banner():
    """Загрузить баннер клана"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'Файл не предоставлен'}), 400
    
    file = request.files['file']
    clan_id = request.form.get('clanId')
    
    if not clan_id:
        return jsonify({'success': False, 'error': 'ID клана обязателен'}), 400
    
    from models import Clan
    clan = Clan.query.filter_by(id=clan_id).first()
    
    if not clan:
        return jsonify({'success': False, 'error': 'Клан не найден'}), 404
    
    from models import ClanMember
    member = ClanMember.query.filter_by(
        clan_id=clan_id,
        player_id=request.current_player.id
    ).first()
    
    if not member or member.role != 'owner':
        return jsonify({'success': False, 'error': 'Только владелец может загружать баннер'}), 403
    
    old_banner = clan.banner_url
    
    url, error = FileService.process_and_save(file, 'clan_banner')
    
    if error:
        return jsonify({'success': False, 'error': error}), 400
    
    if old_banner:
        FileService.delete_file(old_banner)
    
    clan.banner_url = url
    db.session.commit()
    
    return jsonify({
        'success': True,
        'bannerUrl': url
    })
