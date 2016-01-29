'use strict';
// dummies for jshin
var AdWordsReport, AdWordsApp, Logger, SpreadsheetApp = function() {
  return 1;
};

/**
 * SCRIPT STARTS HERE
 * Everything above is just for lazyness.
 */

// Global variables
var PLA_MIN_CONVERSIONS = 1;
var PLA_MIN_CLICKS = 10;
var PLA_MIN_IMPRESSIONS = 250;
var DATE_RANGE = 'LAST_30_DAYS';

function main() {
  // Get the ids of all shopping campaigns in the account
  var shoppingCampaignIds = getAllShoppingCampaignIds();

  // Your KPI-conditions. You can change these at line 1-3;
  var kpiCondition = 'Conversions > ' + PLA_MIN_CONVERSIONS + ' AND ' +
                     'Clicks > ' + PLA_MIN_CLICKS + ' AND ' +
                     'Impressions > ' + PLA_MIN_IMPRESSIONS;

  // All shopping search queries with associated data returned as an array with objects
  var shoppingSearchQueries = getShoppingSearchQueries(shoppingCampaignIds, kpiCondition);

  // All other search queries return in an arras as with strings
  var textSearchQueries = getTextSearchQueries(shoppingCampaignIds);

  // Filter shopping queries that does exists in textSearchQueries
  var proposals = shoppingSearchQueries.filter(function(row){
    return textSearchQueries.indexOf(row.Query) === -1;
  });

  // Create a spreadsheet and returns the spreadsheet class
  var spreadsheet = createSpreadSheetFromObject(proposals);

  Logger.log('Spreadsheet created, you can access it here: ' + spreadsheet.getUrl());

}

function createSpreadSheetFromObject(data) {
  var spreadsheet = SpreadsheetApp.create('getScript.io - Shopping vs Text Search Queries');
  var sheet = spreadsheet.getActiveSheet();

  var sheetData = [];
  var headerRow = [Object.keys(data[0])];

  for (var i = 0; i < data.length; i++) {
    var row = headerRow[0].map(function(key) {
      return data[i][key];
    });
    sheetData.push(row);
  }

  var cols = sheetData[0].length;
  var rows = sheetData.length;

  sheet.getRange(1, 1, 1, cols).setValues(headerRow);
  sheet.getRange(2, 1, rows, cols).setValues(sheetData);

  return spreadsheet;

}

function getShoppingSearchQueries(ids, kpiCondition){
  var report = new AdWordsReport().awql();
      report.select(['Query','Impressions','Clicks','Cost','Ctr','ConvertedClicks','AverageCpc',
        'CostPerConvertedClick','ValuePerConvertedClick','ClickConversionRate','ConversionValue'])
        .from('SEARCH_QUERY_PERFORMANCE_REPORT')
        .where('CampaignId IN [' + ids.toString() + ']')
        .and(kpiCondition)
        .during(DATE_RANGE)
        .run();

  return report;
}

function getTextSearchQueries(ids) {
  var report = new AdWordsReport().awql();
      report.select('Query')
        .from('SEARCH_QUERY_PERFORMANCE_REPORT')
        .where('CampaignId NOT_IN [' + ids.tostring() + ']')
        .during(DATE_RANGE)
        .run().data.map(function(row){
          return row.Query;
        });

  return report;
}

function getAllShoppingCampaignIds() {
  var shoppingCampaignIterator = AdWordsApp.shopphingCampaigns().get();
  var shoppingCampaignIds = [];
  while(shoppingCampaignIterator.hasNext()) {
    var shoppingCampaignId = shoppingCampaignIterator.next().getId();
    shoppingCampaignIds.push(shoppingCampaignId);
  }
  return shoppingCampaignIds;
}


main();
