function main() {
  var report = AdWordsApp.report(
       "SELECT CampaignName, Clicks, Impressions, Cost, ConvertedClicks, SearchBudgetLostImpressionShare " +
       "FROM CAMPAIGN_PERFORMANCE_REPORT " +
       "WHERE SearchBudgetLostImpressionShare > 0.20 " +
       "DURING LAST_30_DAYS"
     );
  var rows = report.rows();
  while (rows.hasNext()) {
    var row = rows.next();
    var campaignName = row.CampaignName;
    var missed = lostDueToBudget(row);

    Logger.log('');
    Logger.log(campaignName + ' have missed out on ' +
      missed.clicks.toFixed(2) + ' clicks, ' +
      missed.impressions.toFixed(2) + ' impressions and ' +
      missed.converions.toFixed(2) + ' converions.');

    Logger.log('You could increase the budget with up to ' +
      missed.budgetIncrease.toFixed(2) + ' per day ' +
     'with out any need to change your max-cpc in order ' +
     'gain what you missed out on.');

    Logger.log('- - - - - - -');
  }
  Logger.log('Run completed');
}

function lostDueToBudget(row) {

  // Get the SearchBudgetLostImpressionShare as a float and decimal
  var impressionShare = parseFloat(row.SearchBudgetLostImpressionShare.replace('%','')) / 100;

  // row.Cost has a thousand separator, lets remove that one...
  var cost = parseFloat(row.Cost.replace(/,/g,''));

  // Calculate what we've missed due to budget
  var missed = {
    budgetIncrease: ((cost / impressionShare) - cost) / 30,
    impressions: (row.Impressions /  impressionShare) - row.Impressions,
    clicks: (row.Clicks / impressionShare) - row.Clicks,
    converions: 0
  };

  // check if they are any converions
  if(row.ConvertedClicks > 0) {
    missed.converions = (row.ConvertedClicks / impressionShare) - row.ConvertedClicks;
  }

  return missed;
}
