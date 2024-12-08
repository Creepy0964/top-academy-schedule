from selenium import webdriver
from selenium.webdriver.common.by import By
import os, time, sqlite3, datetime

service = webdriver.ChromeService(executable_path='./chromedriver')
options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
driver = webdriver.Chrome(options=options, service=service)

db = sqlite3.connect("database.db")
cursor = db.cursor()

def get_day_schedule(x: int) -> str:
    schedule = ""

    for i in range(2, 7):
        try:
            lesson_time = driver.find_element(By.XPATH, f'/html/body/mystat/ng-component/ng-component/div/div[3]/div[2]/ng-component/ng-component/div/div/div[2]/div/div[2]/div/div[4]/div[{i}]/div[{x}]/div/span[1]').get_attribute('innerText')
            lesson = driver.find_element(By.XPATH, f'/html/body/mystat/ng-component/ng-component/div/div[3]/div[2]/ng-component/ng-component/div/div/div[2]/div/div[2]/div/div[4]/div[{i}]/div[{x}]/div/span[2]').get_attribute('innerText')
            room = driver.find_element(By.XPATH, f'/html/body/mystat/ng-component/ng-component/div/div[3]/div[2]/ng-component/ng-component/div/div/div[2]/div/div[2]/div/div[4]/div[{i}]/div[{x}]/div/span[3]/span').get_attribute('innerText')
            teacher = driver.find_element(By.XPATH, f'//html/body/mystat/ng-component/ng-component/div/div[3]/div[2]/ng-component/ng-component/div/div/div[2]/div/div[2]/div/div[4]/div[{i}]/div[{x}]/div/span[4]').get_attribute('innerText')
            schedule += f'Пара №{i - 1}\nВремя: {lesson_time}\nПара: {lesson}\nАудитория: {room}\nПреподаватель: {teacher}\n\n'
        except:
            schedule += f'Пары №{i - 1} нет\n'

    return schedule

def get_schedule() -> list[str]:
    weekday = datetime.datetime.today().weekday()
    
    schedule = []

    driver.get('https://journal.top-academy.ru/ru/auth/login/index')

    time.sleep(2)

    driver.find_element(By.XPATH, '//*[@id="username"]').send_keys('Miron_gy63')

    driver.find_element(By.XPATH, '//*[@id="password"]').send_keys('0348RpGX')

    driver.find_element(By.XPATH, '/html/body/mystat/ng-component/ng-component/section/div/div/div/div/div[1]/tabset/div/tab[1]/form/button').click()

    time.sleep(10)

    driver.get('https://journal.top-academy.ru/ru/main/schedule/page/index')

    time.sleep(10)

    driver.find_element(By.XPATH, '/html/body/mystat/ng-component/ng-component/div/div[3]/div[2]/ng-component/ng-component/div/div/div[2]/div/div[1]/button[2]').click()
    
    time.sleep(3)
    
    if weekday == 6 or weekday == 5:
        driver.find_element(By.XPATH, '/html/body/mystat/ng-component/ng-component/div/div[3]/div[2]/ng-component/ng-component/div/div/div[2]/div/div[2]/div/div[1]/div[2]/span[3]').click()

    time.sleep(5)

    for x in range(1, 6):
        schedule.append(get_day_schedule(x))

    return schedule

zalupa = get_schedule()

week = driver.find_element(By.XPATH, '/html/body/mystat/ng-component/ng-component/div/div[3]/div[2]/ng-component/ng-component/div/div/div[2]/div/div[2]/div/div[1]/div[2]/span[2]').get_attribute('innerText').replace(" ", "").replace("-", "")

cursor.execute(f"DROP TABLE IF EXISTS {week}")
cursor.execute(f'CREATE TABLE {week} ("day"	INTEGER NOT NULL, "schedule" TEXT NOT NULL)')

for i in range(len(zalupa)):
    cursor.execute(f"INSERT INTO {week} (day, schedule) VALUES ({i + 1}, '{zalupa[i]}')")
    db.commit()

print('Расписание получено!')
