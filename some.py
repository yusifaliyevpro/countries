import requests

API_BASE_URL = "https://restcountries.com/v3.1/all"

def get_capitals():
    try:
        response = requests.get(API_BASE_URL)
        response.raise_for_status()  # Raise an exception for any failed request

        countries_data = response.json()
        
        # Get capital cities for countries where "capital" exists
        capitals = [country.get("capital", None) for country in countries_data if "capital" in country]
        
        # Filter out None values in case some countries don't have a capital
        capitals = [capital[0] for capital in capitals if capital is not None]
        
        # Sort capitals alphabetically
        capitals.sort()

        # Return the list of capital cities
        return capitals

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return []

# Call the function and print the result
capitals = get_capitals()
print(capitals)
