

def calculate_hecs_repayment(gross_income: float) -> float:
    hecs_rates = {
        54435: 0,
        62850: 0.01,
        66620: 0.02,
        70618: 0.025,
        74855: 0.03,
        79346: 0.035,
        84107: 0.04,
        89154: 0.045,
        94503: 0.05,
        100174: 0.055,
        106185: 0.06,
        112545: 0.065,
        119309: 0.07,
        126467: 0.075,
        134056: 0.08,
        142100: 0.085, 
        150626: 0.09,
        159663: 0.095,
        999999999: 0.1,
    }
    
    for key, value in hecs_rates.items():
        if gross_income <= key:
            return gross_income * value
        else:
            continue
    
    return 0