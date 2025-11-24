import os
import uuid
from PIL import Image
from werkzeug.utils import secure_filename
from flask import current_app, url_for


class FileService:
    """Сервис для загрузки и обработки файлов"""
    
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB
    
    IMAGE_CONFIGS = {
        'avatar': {
            'max_size': (256, 256),
            'path': 'avatars',
            'quality': 85
        },
        'clan_logo': {
            'max_size': (512, 512),
            'path': 'clan-logos',
            'quality': 90
        },
        'clan_banner': {
            'max_size': (1920, 400),
            'path': 'clan-banners',
            'quality': 90
        }
    }
    
    @staticmethod
    def allowed_file(filename):
        """Проверка допустимого расширения"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in FileService.ALLOWED_EXTENSIONS
    
    @staticmethod
    def validate_image(file):
        """Валидация изображения"""
        if not file:
            return False, 'Файл не предоставлен'
        
        if not FileService.allowed_file(file.filename):
            return False, f'Недопустимый формат. Разрешены: {", ".join(FileService.ALLOWED_EXTENSIONS)}'
        
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > FileService.MAX_FILE_SIZE:
            return False, f'Файл слишком большой. Максимум {FileService.MAX_FILE_SIZE // 1024 // 1024}MB'
        
        try:
            img = Image.open(file)
            img.verify()
            file.seek(0)
            return True, None
        except Exception as e:
            return False, f'Неверный формат изображения: {str(e)}'
    
    @staticmethod
    def process_and_save(file, image_type='avatar'):
        """Обработать и сохранить изображение"""
        valid, error = FileService.validate_image(file)
        if not valid:
            return None, error
        
        config = FileService.IMAGE_CONFIGS.get(image_type)
        if not config:
            return None, 'Неверный тип изображения'
        
        try:
            img = Image.open(file)
            original_format = img.format
            has_transparency = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
            
            # Сохраняем PNG с прозрачностью как PNG, остальное как JPEG
            if has_transparency:
                # Конвертируем в RGBA для сохранения прозрачности
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                
                img.thumbnail(config['max_size'], Image.Resampling.LANCZOS)
                
                filename = f'{uuid.uuid4()}.png'
                upload_folder = current_app.config.get('UPLOAD_FOLDER')
                filepath = os.path.join(upload_folder, config['path'])
                
                os.makedirs(filepath, exist_ok=True)
                
                full_path = os.path.join(filepath, filename)
                img.save(full_path, 'PNG', optimize=True)
            else:
                # Для изображений без прозрачности сохраняем как JPEG
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                img.thumbnail(config['max_size'], Image.Resampling.LANCZOS)
                
                filename = f'{uuid.uuid4()}.jpg'
                upload_folder = current_app.config.get('UPLOAD_FOLDER')
                filepath = os.path.join(upload_folder, config['path'])
                
                os.makedirs(filepath, exist_ok=True)
                
                full_path = os.path.join(filepath, filename)
                img.save(full_path, 'JPEG', quality=config['quality'], optimize=True)
            
            # Генерируем относительный URL для Flask route /api/static/uploads/<path:filename>
            # Используем относительный URL чтобы работать и в dev (через Vite proxy) и в production
            url = url_for('uploaded_file', filename=f"{config['path']}/{filename}")
            
            return url, None
            
        except Exception as e:
            return None, f'Ошибка обработки изображения: {str(e)}'
    
    @staticmethod
    def delete_file(url):
        """Удалить файл"""
        if not url:
            return False
        
        # Поддерживаем как абсолютные URLs, так и относительные пути
        if url.startswith('http'):
            # Извлекаем путь из абсолютного URL
            # Например: https://...repl.co/api/static/uploads/clan-logos/file.jpg -> clan-logos/file.jpg
            if '/api/static/uploads/' in url:
                url = url.split('/api/static/uploads/', 1)[1]
            elif '/static/uploads/' in url:
                url = url.split('/static/uploads/', 1)[1]
            else:
                return False
        elif url.startswith('/api/static/uploads/'):
            url = url[len('/api/static/uploads/'):]
        elif url.startswith('/static/uploads/'):
            url = url[len('/static/uploads/'):]
        else:
            return False
        
        try:
            upload_folder = current_app.config.get('UPLOAD_FOLDER')
            filepath = os.path.join(upload_folder, url)
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
        except Exception:
            pass
        
        return False
