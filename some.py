import requests

API_BASE_URL = "https://restcountries.com/v3.1/all"

def get_cca3_and_capitals():
    try:
        response = requests.get(API_BASE_URL)
        response.raise_for_status()  # Raise an exception for any failed request

        countries_data = response.json()
        
        # Get cca3 codes and capital cities where both "cca3" and "capital" exist
        cca3_and_capitals = [language['name'] for country in countries_data if "currencies" in country for language in country["currencies"].values()]
        # Return cca3 codes and capital cities as a list of tuples
        return cca3_and_capitals

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return []

# Call the function and print the result
cca3_and_capitals = (get_cca3_and_capitals())
langs = set(cca3_and_capitals)
print(sorted(langs))
