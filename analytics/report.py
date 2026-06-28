import pandas as pd
import matplotlib.pyplot as plt
import psycopg2
import os

DB_URL = os.getenv("DATABASE_URL")

def generate_reports():
    print("🔄 Подключение к базе данных...")
    try:
        # Устанавливаем соединение
        conn = psycopg2.connect(DB_URL)
        print("✅ Успешное подключение!")

        # Prisma создает таблицы с заглавной буквы, поэтому используем кавычки "Incident"
        query = 'SELECT id, title, category, priority, status, "createdAt" FROM "Incident"'
        
        # Загружаем данные в DataFrame (умную таблицу pandas)
        df = pd.read_sql(query, conn)
        
        if df.empty:
            print("⚠️ В базе пока нет заявок для анализа.")
            return

        print(f"📊 Найдено заявок: {len(df)}. Генерируем графики...")

        # ---------------------------------------------------------
        # График 1: Столбчатая диаграмма по статусам
        # ---------------------------------------------------------
        plt.figure(figsize=(8, 5))
        status_counts = df['status'].value_counts()
        
        # Настройка внешнего вида
        status_counts.plot(kind='bar', color=['#3b82f6', '#10b981', '#f59e0b', '#ef4444'])
        plt.title('Количество заявок по статусам', fontsize=14, pad=15)
        plt.xlabel('Статус', fontsize=12)
        plt.ylabel('Количество', fontsize=12)
        plt.xticks(rotation=0)
        plt.grid(axis='y', linestyle='--', alpha=0.7)
        
        # Сохраняем как картинку
        plt.tight_layout()
        plt.savefig('status_report.png', dpi=300)
        print("📁 Сохранен файл: status_report.png")

        # ---------------------------------------------------------
        # График 2: Круговая диаграмма по категориям
        # ---------------------------------------------------------
        plt.figure(figsize=(7, 7))
        category_counts = df['category'].value_counts()
        
        category_counts.plot(
            kind='pie', 
            autopct='%1.1f%%', 
            startangle=90, 
            colors=['#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
        )
        plt.title('Распределение инцидентов по категориям', fontsize=14, pad=15)
        plt.ylabel('') # Убираем лишнюю системную подпись
        
        plt.tight_layout()
        plt.savefig('category_report.png', dpi=300)
        print("📁 Сохранен файл: category_report.png")

    except Exception as e:
        print(f"❌ Ошибка: {e}")
    finally:
        # Обязательно закрываем соединение с БД
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    generate_reports()