


def calculate_tax(gross_income: float) -> float:
    tax_rates = {
        "resident": {
            18200: [0,0],
            45000: [0.16,0],
            135000: [0.3,4288],
            190000: [0.37,31288],
            999999999: [0.45,51638],
        }
    }

    medicare_levy_rate = 0.02


    # For now lets assume resident
    tax_rate = 0
    tax_amount = 0
    cut_off = 0
    for i in tax_rates["resident"]:
        if gross_income <= i:
            tax_rate = tax_rates["resident"][i][0]
            tax_amount = tax_rates["resident"][i][1]
            break
        else:
            cut_off = i
    tax = (gross_income - cut_off) * tax_rate + tax_amount
    medicare_levy = gross_income * medicare_levy_rate
    return tax + medicare_levy