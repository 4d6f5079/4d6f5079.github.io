from csv import DictReader
import json

FILE_NAME = "data/COVID-19_aantallen_gemeente_cumulatief.csv"
RES_FILEPATH = "data/covidDataByDate.json"

resDict = {}


def main():
    with open(RES_FILEPATH, "w", encoding="utf-8") as r:
        with open(FILE_NAME) as f:
            csvReader = DictReader(f, delimiter=";")
            for row in csvReader:
                date = row["Date_of_report"]
                province = row["Province"]
                totalReported = int(row["Total_reported"])
                hospitalAdmissions = int(row["Hospital_admission"])
                deceased = int(row["Deceased"])
                municipalityCode = row["Municipality_code"]

                if not municipalityCode:
                    continue

                if not resDict.get(date, False):
                    resDict[date] = {
                        "Groningen": [0, 0, 0],
                        "Friesland": [0, 0, 0],
                        "Drenthe": [0, 0, 0],
                        "Flevoland": [0, 0, 0],
                        "Overijssel": [0, 0, 0],
                        "Gelderland": [0, 0, 0],
                        "Utrecht": [0, 0, 0],
                        "Noord-Holland": [0, 0, 0],
                        "Zuid-Holland": [0, 0, 0],
                        "Zeeland": [0, 0, 0],
                        "Noord-Brabant": [0, 0, 0],
                        "Limburg": [0, 0, 0],
                    }

                currRow = resDict[date][province]
                currRow[0] += totalReported
                currRow[1] += hospitalAdmissions
                currRow[2] += deceased

        json.dump(resDict, r, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    main()
