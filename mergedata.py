#!/usr/bin/python
# -*- coding: utf-8 -*-

import csv
import os
import json
from datetime import datetime


def pprint_row(cnt, row):
    print '{:<3} {:<20} {:<10} {:<10} {:<10} {:<10} {:<10} {:<12}  ' \
          '{:<10}'.format(cnt, row[36], row[2], row[16], row[17],
                          row[18], row[19], row[22], row[23], row[35],
                          row[38])


def main():
    stocks = []
    # Load all the relevant stock data
    files = os.listdir('./stocks')
    for file_cnt, curr_file in enumerate(files):
        if curr_file[0] != '.':
            with open('./stocks/'+curr_file) as infile:
                reader = csv.reader(infile)
                for cnt, row in enumerate(reader):
                    if cnt == 0:
                        continue
                    new_date = datetime.strptime(row[36], '%m/%d/%Y')
                    open_val = high_val = low = price = best_bid = \
                        best_ask = 'NaN'
                    trade_cnt = 0
                    if row[16]:
                        open_val = float(row[16])
                    if row[17]:
                        high_val = float(row[17])
                    if row[18]:
                        low = float(row[18])
                    if row[19]:
                        price = float(row[19])
                    if row[35]:
                        best_bid = float(row[35])
                    if row[38]:
                        best_ask = float(row[38])
                    if row[22]:
                        share_vol = float(row[22])
                    if row[23]:
                        dollar_vol = float(row[23])
                    if row[24]:
                        trade_cnt = float(row[24])
                    if best_ask == 'NaN' and best_bid == 'NaN' and \
                       price == 'NaN' and share_vol == 0.0:
                        continue
                    if row[2] == 'ADVT' and row[9] == 'Grey Market':
                        continue
                    if row[36][-4:] != '2016':
                        continue
                    if row[36][:2] in ['01', '02', '03', '08', '09',
                                       '10', '11', '12']:
                        continue
                    if price == 'NaN' and share_vol and dollar_vol:
                        price = dollar_vol / share_vol
                    if price == 'NaN' and not share_vol and best_bid !=\
                            'NaN' and best_ask != 'Nan':
                        price = (best_bid + best_ask) / 2
                    if price == 'NaN':
                        price = 0
                    # now add the stock record to the list
                    stocks.append({
                        'date': new_date,
                        'id': file_cnt,
                        'ticker': row[2],
                        'open': open_val,
                        'high': high_val,
                        'low': low,
                        'price': price,
                        'shareVol': share_vol,
                        'dollarVol': dollar_vol,
                        'tradeCnt': trade_cnt,
                        'bestBid': best_bid,
                        'bestAsk': best_ask,
                        'hype': 0.0,
                        'hypeCount': 0.0
                    })
    # Now lets add in the hype factor
    files = os.listdir('./hype')
    for curr_file in files:
        if curr_file[0] != '.':
            with open('./hype/'+curr_file) as infile:
                reader = csv.reader(infile)
                symbol = curr_file.split('-')[0]
                for cnt, row in enumerate(reader):
                    if cnt == 0:
                        continue
                    new_date = datetime.strptime(row[0], '%Y-%m-%d')
                    for entry, item in enumerate(stocks):
                        if item['date'] == new_date and \
                           item['ticker'] == symbol:
                            stocks[entry]['hype'] = float(row[1])
                            stocks[entry]['hypeCount'] = float(row[2])
    # convert all datetime objects to strings
    for cnt in range(len(stocks)):
        stocks[cnt]['date'] = stocks[cnt]['date'].strftime('%m/%d/%Y')
    # save to file
    with open('stocks.json', 'w') as f:
        json.dump(stocks, f)


# call the main() function to begin the program.
if __name__ == '__main__':
    main()
