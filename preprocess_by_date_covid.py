from csv import DictReader, DictWriter

FILE_NAME = "data/COVID-19_aantallen_gemeente_cumulatief.csv"
RES_FILEPATH = "data/covidDataByDate.csv"

resList = []
headers = None

provinceCounters = {
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


def main():
    global provinceCounters
    
    with open(RES_FILEPATH, "w", newline="") as r:
        with open(FILE_NAME) as f:
            csvReader = DictReader(f, delimiter=";")
            headers = csvReader.fieldnames
            prevDate = None
            for row in csvReader:
                currDate = row["Date_of_report"]

                if prevDate is None:
                    prevDate = currDate

                if prevDate != currDate:
                    prevDate = currDate
                    provinceCounters = {
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

                province = row["Province"]
                totalReported = int(row["Total_reported"])
                hospitalAdmissions = int(row["Hospital_admission"])
                deceased = int(row["Deceased"])
                municipalityCode = row["Municipality_code"]

                if not municipalityCode:
                    newRow = row
                    newRow["Total_reported"] = str(provinceCounters[province][0])
                    newRow["Hospital_admission"] = str(provinceCounters[province][1])
                    newRow["Deceased"] = str(provinceCounters[province][2])
                    resList.append(newRow)
                else:
                    resList.append(row)
                    provinceCounters[province][0] += totalReported
                    provinceCounters[province][1] += hospitalAdmissions
                    provinceCounters[province][2] += deceased

        dw = DictWriter(r, delimiter=";", fieldnames=headers)

        prev_headers = headers
        headers = {}
        for h in prev_headers:
            headers[h] = h

        dw.writerow(headers)

        for rw in resList:
            dw.writerow(rw)


if __name__ == "__main__":
    main()


# resDict[date] = [
#                         {
#                             "Province": "Groningen",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Friesland",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Drenthe",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Flevoland",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Overijssel",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Gelderland",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Utrecht",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Noord-Holland",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Zuid-Holland",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Zeeland",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Noord-Brabant",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                         {
#                             "Province": "Limburg",
#                             "Total_reported": 0,
#                             "Hospital_admission": 0,
#                             "Deceased": 0,
#                         },
#                     ]
