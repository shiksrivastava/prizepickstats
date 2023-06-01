from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import pandas as pd

def scrape():
    # Set up the WebDriver
    driver = webdriver.Chrome()  # Assuming you installed ChromeDriver and it's in your system's PATH
    driver.get("https://app.prizepicks.com/")

    driver.find_element(By.CLASS_NAME, "close").click()
    time.sleep(2)
    driver.find_element(By.XPATH, "//div[@class='name'][normalize-space()='NBA']").click()
    time.sleep(2)

    # Wait for the stat-container element to be present and visible
    stat_container = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CLASS_NAME, "stat-container")))

    # Find all stat elements within the stat-container
    # i.e. categories is the list ['Points','Rebounds',...,'Turnovers']
    categories = driver.find_element(By.CSS_SELECTOR, ".stat-container").text.split('\n')

    # Initialize empty list to store data
    nbaPlayers = []

    # Iterate over each stat element
    for category in categories:
        # Click the stat element
        line = '-'*len(category)
        print(line + '\n' + category + '\n' + line)
        driver.find_element(By.XPATH, f"//div[text()='{category}']").click()

        projections = WebDriverWait(driver, 20).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".projection")))

        for projection in projections:

            names = projection.find_element(By.XPATH, './/div[@class="name"]').text
            opps = projection.find_element(By.XPATH, './/div[@class="opponent"]').text
            dates = projection.find_element(By.XPATH, './/div[@class="date"]').text
            points= projection.find_element(By.XPATH, './/div[@class="presale-score"]').get_attribute('innerHTML')
            text = projection.find_element(By.XPATH, './/div[@class="text"]').text.replace('\n','')
            print(names, points, text)

            players = {'Name': names, 'Prop':points, 'Line':text, 'Opp': opps, 'Date': dates}

            nbaPlayers.append(players)
    driver.quit()
    df= pd.DataFrame(nbaPlayers)
    df.to_json('scrape.json')
    return df


if __name__ == '__main__':
    scrape()

