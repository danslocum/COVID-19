import pandas as pd
import numpy as np
from matplotlib import pyplot as plt

def significant_event(x):
    t = x.copy()
    bollinger_band_std = 2.0
    t['new_cases'] = t.cases - t.cases.shift(periods=1).fillna(0)
    t['rolling_new_cases_mean'] = t.new_cases.rolling(7).mean()
    t['rolling_new_cases_std'] = t.new_cases.rolling(7).std()
    t['rolling_new_cases_extreme_high'] = t.rolling_new_cases_mean + t.rolling_new_cases_std * bollinger_band_std
    t['rolling_new_cases_extreme_low'] = t.rolling_new_cases_mean - t.rolling_new_cases_std * bollinger_band_std
    t = t.fillna(0)
    t['new_cases_significance'] = np.logical_or(t.rolling_new_cases_extreme_low > t.new_cases, t.new_cases > t.rolling_new_cases_extreme_high)
    t[:7] = False
    return t

data = pd.read_csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
data.date = pd.to_datetime(data.date)
data_grouped = data.groupby(['fips'])
data_significant = data_grouped.apply(lambda x: significant_event(x))
data_significant = data_significant[data_significant.date != False]
data_significant.to_csv("covid_significant_events.csv", index=False)

print(len(data_significant[data_significant.new_cases_significance]))
print(len(data_significant))
