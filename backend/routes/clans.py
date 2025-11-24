from flask import request, jsonify, current_app
from sqlalchemy.exc import IntegrityError
from . import api
from models import db, Clan, ClanMember, ClanApplication, ClanInvitation, Player
from services.auth_service import require_auth


@api.route('/clans', methods=['GET'])
def get_clans():
    """Получить список всех кланов"""
    try:
        clans = Clan.query.order_by(Clan.created_at.desc()).all()
        return jsonify({
            'success': True,
            'clans': [clan.to_dict() for clan in clans]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>', methods=['GET'])
def get_clan(clan_id):
    """Получить информацию о конкретном клане"""
    try:
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        return jsonify({
            'success': True,
            'clan': clan.to_dict(include_members=True)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans', methods=['POST'])
@require_auth
def create_clan():
    """Создать новый клан (только для админов)"""
    # Проверка прав админа
    admin_steam_ids = current_app.config.get('ADMIN_STEAM_IDS', [])
    if request.current_player.steam_id not in admin_steam_ids:
        return jsonify({
            'success': False,
            'error': 'Недостаточно прав. Только админы могут создавать кланы.'
        }), 403
    
    try:
        data = request.get_json(silent=True)
        
        # Проверка валидности JSON
        if not data or not isinstance(data, dict):
            return jsonify({
                'success': False,
                'error': 'Невалидный JSON или отсутствует тело запроса'
            }), 400
        
        # Валидация обязательных полей
        if not data.get('name') or not data.get('tag'):
            return jsonify({
                'success': False,
                'error': 'Название и тег клана обязательны'
            }), 400
        
        # Проверка допустимых значений theme
        theme = data.get('theme', 'orange')
        if theme not in ['orange', 'blue', 'yellow']:
            return jsonify({
                'success': False,
                'error': 'Недопустимое значение theme. Разрешены: orange, blue, yellow'
            }), 400
        
        # Получаем owner_steam_id (опционально)
        owner_steam_id = data.get('ownerSteamId')
        
        # Создание клана
        clan = Clan(
            name=data['name'],
            tag=data['tag'],
            description=data.get('description'),
            theme=theme,
            banner_url=data.get('bannerUrl'),
            logo_url=data.get('logoUrl'),
            requirements=data.get('requirements', {})
        )
        
        db.session.add(clan)
        db.session.flush()  # Получаем clan.id до commit
        
        # Если указан owner, создаем связь ClanMember
        if owner_steam_id:
            player = Player.query.filter_by(steam_id=owner_steam_id).first()
            if not player:
                db.session.rollback()
                return jsonify({
                    'success': False,
                    'error': 'Игрок с таким Steam ID не найден'
                }), 404
            
            # Проверяем что игрок не в другом клане
            if player.current_clan_id:
                db.session.rollback()
                return jsonify({
                    'success': False,
                    'error': 'Игрок уже состоит в другом клане'
                }), 409
            
            # Создаем членство с ролью owner
            member = ClanMember(
                clan_id=clan.id,
                player_id=player.id,
                role='owner'
            )
            db.session.add(member)
            
            # Обновляем current_clan_id игрока
            player.current_clan_id = clan.id
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'clan': clan.to_dict()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Клан с таким тегом уже существует'
        }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>', methods=['PUT'])
@require_auth
def update_clan(clan_id):
    """Обновить информацию о клане (только для владельца клана)"""
    try:
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        # Проверка что пользователь является владельцем клана
        membership = ClanMember.query.filter_by(
            clan_id=clan_id,
            player_id=request.current_player.id,
            role='owner'
        ).first()
        
        if not membership:
            return jsonify({
                'success': False,
                'error': 'Только владелец клана может редактировать его данные'
            }), 403
        
        data = request.get_json(silent=True)
        
        # Проверка валидности JSON
        if not data or not isinstance(data, dict):
            return jsonify({
                'success': False,
                'error': 'Невалидный JSON или отсутствует тело запроса'
            }), 400
        
        # Обновляем только переданные поля
        if 'name' in data:
            clan.name = data['name']
        if 'tag' in data:
            clan.tag = data['tag']
        if 'description' in data:
            clan.description = data['description']
        if 'theme' in data:
            if data['theme'] not in ['orange', 'blue', 'yellow']:
                return jsonify({
                    'success': False,
                    'error': 'Недопустимое значение theme'
                }), 400
            clan.theme = data['theme']
        if 'bannerUrl' in data:
            clan.banner_url = data['bannerUrl']
        if 'logoUrl' in data:
            clan.logo_url = data['logoUrl']
        if 'requirements' in data:
            clan.requirements = data['requirements']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'clan': clan.to_dict()
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Клан с таким тегом уже существует'
        }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>', methods=['DELETE'])
@require_auth
def delete_clan(clan_id):
    """Удалить клан (только для владельца клана)"""
    try:
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        # Проверка что пользователь является владельцем клана
        membership = ClanMember.query.filter_by(
            clan_id=clan_id,
            player_id=request.current_player.id,
            role='owner'
        ).first()
        
        if not membership:
            return jsonify({
                'success': False,
                'error': 'Только владелец клана может удалить его'
            }), 403
        
        db.session.delete(clan)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Клан успешно удален'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>/members', methods=['GET'])
def get_clan_members(clan_id):
    """Получить список участников клана с реальными онлайн статусами из Steam API"""
    try:
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        members = ClanMember.query.filter_by(clan_id=clan_id).all()
        
        # Получаем онлайн статусы через Steam API (batch запрос эффективнее)
        try:
            from services.steam_service import steam_service
            
            # Собираем все Steam ID
            steam_ids = [m.player.steam_id for m in members if m.player and m.player.steam_id]
            
            # Получаем статусы одним запросом (до 100 игроков за раз)
            statuses = steam_service.get_online_statuses(steam_ids) if steam_ids else {}
            
            # Формируем ответ с использованием полученных статусов
            members_data = []
            for member in members:
                member_dict = member.to_dict(include_online_status=False)
                
                # Добавляем онлайн статус из Steam API
                if member.player and member.player.steam_id in statuses:
                    if 'player' in member_dict and member_dict['player']:
                        member_dict['player']['onlineStatus'] = statuses[member.player.steam_id]
                
                members_data.append(member_dict)
            
            return jsonify({
                'success': True,
                'members': members_data
            }), 200
            
        except Exception as steam_error:
            # Fallback на last_login если Steam API недоступен
            print(f"[STEAM API ERROR] Используем fallback на last_login: {steam_error}")
            return jsonify({
                'success': True,
                'members': [member.to_dict(include_online_status=True, use_steam_api=False) for member in members]
            }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ===== УПРАВЛЕНИЕ УЧАСТНИКАМИ =====

@api.route('/clans/<clan_id>/join', methods=['POST'])
@require_auth
def join_clan(clan_id):
    """Вступить в клан (прямое вступление, если нет требований)"""
    try:
        player = request.current_player
        clan = Clan.query.get(clan_id)
        
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        # Проверка - уже в этом клане?
        existing = ClanMember.query.filter_by(clan_id=clan_id, player_id=player.id).first()
        if existing:
            return jsonify({
                'success': False,
                'error': 'Вы уже состоите в этом клане'
            }), 400
        
        # Проверка - уже в другом клане?
        if player.current_clan_id:
            return jsonify({
                'success': False,
                'error': 'Вы уже состоите в другом клане. Сначала покиньте его.'
            }), 400
        
        # Прямое вступление (без заявок)
        member = ClanMember(
            clan_id=clan_id,
            player_id=player.id,
            role='member'
        )
        
        player.current_clan_id = clan_id
        db.session.add(member)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'member': member.to_dict()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Вы уже состоите в этом клане'
        }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>/leave', methods=['POST'])
@require_auth
def leave_clan(clan_id):
    """Покинуть клан"""
    try:
        player = request.current_player
        
        member = ClanMember.query.filter_by(clan_id=clan_id, player_id=player.id).first()
        
        if not member:
            return jsonify({
                'success': False,
                'error': 'Вы не состоите в этом клане'
            }), 404
        
        # Владелец не может покинуть клан (должен сначала передать права)
        if member.role == 'owner':
            return jsonify({
                'success': False,
                'error': 'Владелец не может покинуть клан. Сначала передайте права другому участнику.'
            }), 403
        
        player.current_clan_id = None
        db.session.delete(member)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Вы покинули клан'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>/members/<member_id>', methods=['DELETE'])
@require_auth
def kick_member(clan_id, member_id):
    """Исключить участника (только для владельца)"""
    try:
        player = request.current_player
        
        # Проверка прав - только владелец может исключать
        owner_member = ClanMember.query.filter_by(
            clan_id=clan_id,
            player_id=player.id,
            role='owner'
        ).first()
        
        if not owner_member:
            return jsonify({
                'success': False,
                'error': 'Только владелец может исключать участников'
            }), 403
        
        # Найти участника для исключения по ID членства
        member = ClanMember.query.filter_by(id=member_id, clan_id=clan_id).first()
        
        if not member:
            return jsonify({
                'success': False,
                'error': 'Участник не найден'
            }), 404
        
        # Нельзя исключить владельца
        if member.role == 'owner':
            return jsonify({
                'success': False,
                'error': 'Нельзя исключить владельца'
            }), 403
        
        # Обнулить current_clan_id у игрока
        member.player.current_clan_id = None
        
        db.session.delete(member)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Участник исключен из клана'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>/members/<member_id>/role', methods=['PUT'])
@require_auth
def change_member_role(clan_id, member_id):
    """Изменить роль участника (promote/demote) - только для владельца"""
    try:
        player = request.current_player
        data = request.get_json(silent=True)
        
        if not data or 'role' not in data:
            return jsonify({
                'success': False,
                'error': 'Роль обязательна'
            }), 400
        
        new_role = data['role']
        if new_role not in ['owner', 'member']:
            return jsonify({
                'success': False,
                'error': 'Недопустимая роль. Разрешены: owner, member'
            }), 400
        
        # Проверка прав - только владелец может менять роли
        owner_member = ClanMember.query.filter_by(
            clan_id=clan_id,
            player_id=player.id,
            role='owner'
        ).first()
        
        if not owner_member:
            return jsonify({
                'success': False,
                'error': 'Только владелец может менять роли'
            }), 403
        
        # Найти участника по ID членства
        member = ClanMember.query.filter_by(id=member_id, clan_id=clan_id).first()
        
        if not member:
            return jsonify({
                'success': False,
                'error': 'Участник не найден'
            }), 404
        
        # Нельзя понизить самого себя если ты единственный владелец
        if member.id == owner_member.id and new_role != 'owner':
            # Проверить есть ли другие владельцы
            other_owners = ClanMember.query.filter_by(
                clan_id=clan_id,
                role='owner'
            ).filter(ClanMember.id != owner_member.id).count()
            
            if other_owners == 0:
                return jsonify({
                    'success': False,
                    'error': 'Нельзя понизить единственного владельца'
                }), 403
        
        # Если передаем роль владельца - сначала повысим target, потом понизим остальных
        if new_role == 'owner' and member.id != owner_member.id:
            # Сначала повысить target до owner
            member.role = 'owner'
            
            # Найти всех владельцев клана кроме нового
            all_owners = ClanMember.query.filter_by(
                clan_id=clan_id,
                role='owner'
            ).filter(ClanMember.id != member.id).all()
            
            # Понизить всех остальных владельцев до member
            for current_owner in all_owners:
                current_owner.role = 'member'
        else:
            # Обычное изменение роли (не связанное с передачей прав owner)
            member.role = new_role
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'member': member.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ===== СИСТЕМА ЗАЯВОК =====

@api.route('/clans/<clan_id>/apply', methods=['POST'])
@require_auth
def apply_to_clan(clan_id):
    """Подать заявку на вступление в клан"""
    try:
        player = request.current_player
        data = request.get_json(silent=True) or {}
        
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        # Проверка - уже в клане?
        existing_member = ClanMember.query.filter_by(clan_id=clan_id, player_id=player.id).first()
        if existing_member:
            return jsonify({
                'success': False,
                'error': 'Вы уже состоите в этом клане'
            }), 400
        
        # Проверка - уже в другом клане?
        if player.current_clan_id:
            return jsonify({
                'success': False,
                'error': 'Вы уже состоите в другом клане'
            }), 400
        
        # Проверка - есть ли активная заявка?
        existing_app = ClanApplication.query.filter_by(
            clan_id=clan_id,
            player_id=player.id,
            status='pending'
        ).first()
        
        if existing_app:
            return jsonify({
                'success': False,
                'error': 'У вас уже есть активная заявка в этот клан'
            }), 400
        
        # Создать заявку
        application = ClanApplication(
            clan_id=clan_id,
            player_id=player.id,
            message=data.get('message'),
            status='pending'
        )
        
        db.session.add(application)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'application': application.to_dict()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'У вас уже есть заявка в этот клан'
        }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>/applications', methods=['GET'])
@require_auth
def get_clan_applications(clan_id):
    """Получить список заявок в клан (только для владельца)"""
    try:
        player = request.current_player
        
        # Проверка прав - только владелец может видеть заявки
        owner_member = ClanMember.query.filter_by(
            clan_id=clan_id,
            player_id=player.id,
            role='owner'
        ).first()
        
        if not owner_member:
            return jsonify({
                'success': False,
                'error': 'Только владелец может просматривать заявки'
            }), 403
        
        status = request.args.get('status', 'pending')
        applications = ClanApplication.query.filter_by(
            clan_id=clan_id,
            status=status
        ).order_by(ClanApplication.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'applications': [app.to_dict() for app in applications]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>/applications', methods=['POST'])
@require_auth
def create_clan_application(clan_id):
    """Создать заявку на вступление в клан"""
    try:
        player = request.current_player
        data = request.get_json()
        
        # Валидация данных запроса
        if not data or 'message' not in data:
            return jsonify({'success': False, 'error': 'Сопроводительное письмо обязательно'}), 400
        
        message = data.get('message', '').strip()
        
        # Проверяем что сообщение не пустое
        if not message:
            return jsonify({'success': False, 'error': 'Сопроводительное письмо не может быть пустым'}), 400
        
        # Проверяем максимальную длину сообщения (500 символов)
        if len(message) > 500:
            return jsonify({'success': False, 'error': 'Сопроводительное письмо не может быть длиннее 500 символов'}), 400
        
        # Проверяем существование клана
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({'success': False, 'error': 'Клан не найден'}), 404
        
        # Проверяем что игрок не в клане
        if player.current_clan_id:
            return jsonify({'success': False, 'error': 'Вы уже состоите в клане'}), 400
        
        # Проверяем что уже нет активной заявки в этот клан
        existing_app = ClanApplication.query.filter_by(
            clan_id=clan_id,
            player_id=player.id,
            status='pending'
        ).first()
        
        if existing_app:
            return jsonify({'success': False, 'error': 'У вас уже есть активная заявка в этот клан'}), 400
        
        # Создаем заявку
        application = ClanApplication(
            clan_id=clan_id,
            player_id=player.id,
            message=message,
            status='pending',
            stats_snapshot={}  # TODO: добавить snapshot статистики игрока
        )
        
        db.session.add(application)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': application.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/applications/my', methods=['GET'])
@require_auth
def get_my_applications():
    """Получить мои активные заявки"""
    try:
        player = request.current_player
        
        applications = ClanApplication.query.filter_by(
            player_id=player.id,
            status='pending'
        ).order_by(ClanApplication.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'applications': [app.to_dict() for app in applications]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>/applications/<application_id>/approve', methods=['POST'])
@require_auth
def approve_application(clan_id, application_id):
    """Принять заявку (только для владельца)"""
    try:
        player = request.current_player
        
        # Проверка прав - только владелец может принимать заявки
        owner_member = ClanMember.query.filter_by(
            clan_id=clan_id,
            player_id=player.id,
            role='owner'
        ).first()
        
        if not owner_member:
            return jsonify({
                'success': False,
                'error': 'Только владелец может принимать заявки'
            }), 403
        
        # Найти заявку
        application = ClanApplication.query.filter_by(
            id=application_id,
            clan_id=clan_id,
            status='pending'
        ).first()
        
        if not application:
            return jsonify({
                'success': False,
                'error': 'Заявка не найдена или уже обработана'
            }), 404
        
        # Проверить что игрок все еще не в клане
        if application.player.current_clan_id:
            application.status = 'rejected'
            db.session.commit()
            return jsonify({
                'success': False,
                'error': 'Игрок уже состоит в другом клане'
            }), 400
        
        # Создать участника
        member = ClanMember(
            clan_id=clan_id,
            player_id=application.player_id,
            role='member',
            stats_snapshot=application.stats_snapshot
        )
        
        # Обновить current_clan_id у игрока
        application.player.current_clan_id = clan_id
        
        # Принять эту заявку
        application.status = 'accepted'
        db.session.add(member)
        
        # ВАЖНО: Автоматически отклонить все остальные pending заявки этого игрока
        # Игрок может подавать заявки в несколько кланов, но после принятия в один -
        # все остальные заявки должны быть отклонены
        other_applications = ClanApplication.query.filter(
            ClanApplication.player_id == application.player_id,
            ClanApplication.id != application.id,
            ClanApplication.status == 'pending'
        ).all()
        
        for other_app in other_applications:
            other_app.status = 'rejected'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'member': member.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>/applications/<application_id>/reject', methods=['POST'])
@require_auth
def reject_application(clan_id, application_id):
    """Отклонить заявку (только для владельца)"""
    try:
        player = request.current_player
        
        # Проверка прав - только владелец может отклонять заявки
        owner_member = ClanMember.query.filter_by(
            clan_id=clan_id,
            player_id=player.id,
            role='owner'
        ).first()
        
        if not owner_member:
            return jsonify({
                'success': False,
                'error': 'Только владелец может отклонять заявки'
            }), 403
        
        # Найти заявку
        application = ClanApplication.query.filter_by(
            id=application_id,
            clan_id=clan_id,
            status='pending'
        ).first()
        
        if not application:
            return jsonify({
                'success': False,
                'error': 'Заявка не найдена или уже обработана'
            }), 404
        
        application.status = 'rejected'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Заявка отклонена'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/applications/<application_id>/withdraw', methods=['POST'])
@require_auth
def withdraw_application(application_id):
    """Отозвать свою заявку"""
    try:
        player = request.current_player
        
        application = ClanApplication.query.filter_by(
            id=application_id,
            player_id=player.id,
            status='pending'
        ).first()
        
        if not application:
            return jsonify({
                'success': False,
                'error': 'Заявка не найдена или уже обработана'
            }), 404
        
        db.session.delete(application)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Заявка отозвана'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ===== СИСТЕМА ПРИГЛАШЕНИЙ =====

@api.route('/clans/<clan_id>/invite', methods=['POST'])
@require_auth
def invite_to_clan(clan_id):
    """Пригласить игрока в клан (только для владельца)"""
    try:
        player = request.current_player
        data = request.get_json(silent=True)
        
        if not data or 'playerId' not in data:
            return jsonify({
                'success': False,
                'error': 'ID игрока обязателен'
            }), 400
        
        # Проверка прав - только владелец может приглашать
        owner_member = ClanMember.query.filter_by(
            clan_id=clan_id,
            player_id=player.id,
            role='owner'
        ).first()
        
        if not owner_member:
            return jsonify({
                'success': False,
                'error': 'Только владелец может приглашать игроков'
            }), 403
        
        invited_player = Player.query.get(data['playerId'])
        if not invited_player:
            return jsonify({
                'success': False,
                'error': 'Игрок не найден'
            }), 404
        
        # Проверка - игрок уже в клане?
        if invited_player.current_clan_id:
            return jsonify({
                'success': False,
                'error': 'Игрок уже состоит в клане'
            }), 400
        
        # Проверка - уже есть активное приглашение?
        existing_inv = ClanInvitation.query.filter_by(
            clan_id=clan_id,
            player_id=invited_player.id,
            status='pending'
        ).first()
        
        if existing_inv:
            return jsonify({
                'success': False,
                'error': 'Игрок уже приглашен в этот клан'
            }), 400
        
        # Создать приглашение
        invitation = ClanInvitation(
            clan_id=clan_id,
            player_id=invited_player.id,
            invited_by_id=player.id,
            message=data.get('message'),
            status='pending'
        )
        
        db.session.add(invitation)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'invitation': invitation.to_dict()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Приглашение уже существует'
        }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/invitations/my', methods=['GET'])
@require_auth
def get_my_invitations():
    """Получить мои приглашения"""
    try:
        player = request.current_player
        
        invitations = ClanInvitation.query.filter_by(
            player_id=player.id,
            status='pending'
        ).order_by(ClanInvitation.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'invitations': [inv.to_dict() for inv in invitations]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>/invitations', methods=['GET'])
@require_auth
def get_clan_invitations(clan_id):
    """Получить список приглашений клана (только для владельца)"""
    try:
        player = request.current_player
        
        # Проверка прав - только владелец может видеть приглашения
        owner_member = ClanMember.query.filter_by(
            clan_id=clan_id,
            player_id=player.id,
            role='owner'
        ).first()
        
        if not owner_member:
            return jsonify({
                'success': False,
                'error': 'Только владелец может просматривать приглашения'
            }), 403
        
        status = request.args.get('status', 'pending')
        invitations = ClanInvitation.query.filter_by(
            clan_id=clan_id,
            status=status
        ).order_by(ClanInvitation.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'invitations': [inv.to_dict() for inv in invitations]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/invitations/<invitation_id>/accept', methods=['POST'])
@require_auth
def accept_invitation(invitation_id):
    """Принять приглашение"""
    try:
        player = request.current_player
        
        invitation = ClanInvitation.query.filter_by(
            id=invitation_id,
            player_id=player.id,
            status='pending'
        ).first()
        
        if not invitation:
            return jsonify({
                'success': False,
                'error': 'Приглашение не найдено или уже обработано'
            }), 404
        
        # Проверка - уже в клане?
        if player.current_clan_id:
            return jsonify({
                'success': False,
                'error': 'Вы уже состоите в клане'
            }), 400
        
        # Создать участника
        member = ClanMember(
            clan_id=invitation.clan_id,
            player_id=player.id,
            role='member'
        )
        
        player.current_clan_id = invitation.clan_id
        invitation.status = 'accepted'
        
        db.session.add(member)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'member': member.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/invitations/<invitation_id>/reject', methods=['POST'])
@require_auth
def reject_invitation(invitation_id):
    """Отклонить приглашение"""
    try:
        player = request.current_player
        
        invitation = ClanInvitation.query.filter_by(
            id=invitation_id,
            player_id=player.id,
            status='pending'
        ).first()
        
        if not invitation:
            return jsonify({
                'success': False,
                'error': 'Приглашение не найдено или уже обработано'
            }), 404
        
        invitation.status = 'rejected'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Приглашение отклонено'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/invitations/<invitation_id>/cancel', methods=['POST'])
@require_auth
def cancel_invitation(invitation_id):
    """Отменить приглашение (только для владельца клана)"""
    try:
        player = request.current_player
        
        invitation = ClanInvitation.query.filter_by(
            id=invitation_id,
            status='pending'
        ).first()
        
        if not invitation:
            return jsonify({
                'success': False,
                'error': 'Приглашение не найдено или уже обработано'
            }), 404
        
        # Проверка прав - только владелец клана может отменять приглашения
        owner_member = ClanMember.query.filter_by(
            clan_id=invitation.clan_id,
            player_id=player.id,
            role='owner'
        ).first()
        
        if not owner_member:
            return jsonify({
                'success': False,
                'error': 'Только владелец клана может отменять приглашения'
            }), 403
        
        db.session.delete(invitation)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Приглашение отменено'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ===== АДМИНСКИЕ ENDPOINTS =====

@api.route('/admin/clans/<clan_id>/assign-owner', methods=['POST'])
@require_auth
def admin_assign_owner(clan_id):
    """Назначить owner клана (только для админов)"""
    # Проверка прав админа
    admin_steam_ids = current_app.config.get('ADMIN_STEAM_IDS', [])
    if request.current_player.steam_id not in admin_steam_ids:
        return jsonify({
            'success': False,
            'error': 'Недостаточно прав. Только админы могут назначать владельцев кланов.'
        }), 403
    
    try:
        data = request.get_json(silent=True)
        
        if not data or 'steamId' not in data:
            return jsonify({
                'success': False,
                'error': 'steamId обязателен'
            }), 400
        
        steam_id = data['steamId']
        
        # Проверка существования клана
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        # Проверка существования игрока по Steam ID
        player = Player.query.filter_by(steam_id=steam_id).first()
        if not player:
            return jsonify({
                'success': False,
                'error': 'Игрок с таким Steam ID не найден'
            }), 404
        
        # Проверка что игрок не в другом клане
        if player.current_clan_id and player.current_clan_id != clan_id:
            return jsonify({
                'success': False,
                'error': 'Игрок уже состоит в другом клане'
            }), 409
        
        # Найти текущее членство или создать новое
        member = ClanMember.query.filter_by(
            clan_id=clan_id,
            player_id=player.id
        ).first()
        
        if member:
            # Обновить существующее членство
            member.role = 'owner'
        else:
            # Создать новое членство
            member = ClanMember(
                clan_id=clan_id,
                player_id=player.id,
                role='owner'
            )
            db.session.add(member)
            
            # Обновить current_clan_id игрока
            player.current_clan_id = clan_id
        
        # Понизить всех остальных владельцев до member
        other_owners = ClanMember.query.filter_by(
            clan_id=clan_id,
            role='owner'
        ).filter(ClanMember.player_id != player.id).all()
        
        for current_owner in other_owners:
            current_owner.role = 'member'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Владелец клана назначен',
            'member': member.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/admin/clans', methods=['GET'])
@require_auth
def admin_get_all_clans():
    """Получить все кланы с детальной информацией (только для админов)"""
    # Проверка прав админа
    admin_steam_ids = current_app.config.get('ADMIN_STEAM_IDS', [])
    if request.current_player.steam_id not in admin_steam_ids:
        return jsonify({
            'success': False,
            'error': 'Недостаточно прав. Только админы могут просматривать все кланы.'
        }), 403
    
    try:
        clans = Clan.query.order_by(Clan.created_at.desc()).all()
        return jsonify({
            'success': True,
            'clans': [clan.to_dict(include_members=True) for clan in clans]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/admin/clans/<clan_id>', methods=['PUT'])
@require_auth
def admin_update_clan(clan_id):
    """Обновить клан (только для админов)"""
    # Проверка прав админа
    admin_steam_ids = current_app.config.get('ADMIN_STEAM_IDS', [])
    if request.current_player.steam_id not in admin_steam_ids:
        return jsonify({
            'success': False,
            'error': 'Недостаточно прав. Только админы могут редактировать кланы.'
        }), 403
    
    try:
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return jsonify({
                'success': False,
                'error': 'Невалидный JSON или отсутствует тело запроса'
            }), 400
        
        # Обновляем поля клана
        if 'name' in data:
            clan.name = data['name']
        if 'tag' in data:
            clan.tag = data['tag']
        if 'description' in data:
            clan.description = data['description']
        if 'theme' in data:
            if data['theme'] not in ['orange', 'blue', 'yellow']:
                return jsonify({
                    'success': False,
                    'error': 'Недопустимое значение theme'
                }), 400
            clan.theme = data['theme']
        if 'bannerUrl' in data:
            clan.banner_url = data['bannerUrl']
        if 'logoUrl' in data:
            clan.logo_url = data['logoUrl']
        if 'level' in data:
            clan.level = int(data['level'])
        if 'winrate' in data:
            clan.winrate = float(data['winrate'])
        if 'maxMembers' in data:
            clan.max_members = int(data['maxMembers'])
        if 'requirements' in data:
            clan.requirements = data['requirements']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Клан обновлен',
            'clan': clan.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/admin/clans/<clan_id>', methods=['DELETE'])
@require_auth
def admin_delete_clan(clan_id):
    """Удалить клан (только для админов)"""
    # Проверка прав админа
    admin_steam_ids = current_app.config.get('ADMIN_STEAM_IDS', [])
    if request.current_player.steam_id not in admin_steam_ids:
        return jsonify({
            'success': False,
            'error': 'Недостаточно прав. Только админы могут удалять кланы.'
        }), 403
    
    try:
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        # Удаляем всех участников клана
        ClanMember.query.filter_by(clan_id=clan_id).delete()
        
        # Удаляем все заявки в клан
        ClanApplication.query.filter_by(clan_id=clan_id).delete()
        
        # Удаляем все приглашения в клан
        ClanInvitation.query.filter_by(clan_id=clan_id).delete()
        
        # Обновляем current_clan_id у всех игроков
        Player.query.filter_by(current_clan_id=clan_id).update({'current_clan_id': None})
        
        # Удаляем сам клан
        db.session.delete(clan)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Клан удален'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
