// Global variables
var COLUMNS = [
  'Query','Impressions','Clicks','Cost','Ctr',
  'ConvertedClicks','AverageCpc','CostPerConvertedClick',
  'ValuePerConvertedClick','ClickConversionRate','ConversionValue'
];
var PLA_MIN_CONVERSIONS = 0;
var PLA_MIN_CLICKS = 0;
var PLA_MIN_IMPRESSIONS = 20;
var DATE_RANGE = 'LAST_30_DAYS';
var REPORT_NAME = 'Shopping vs Text Search Queries';

function main() {
  // Get the ids of all shopping campaigns in the account
  var shoppingCampaignIds = getAllShoppingCampaignIds();

  // Your KPI-conditions. You can change these at line 1-3;
  var kpiCondition = 'ConvertedClicks >= ' + PLA_MIN_CONVERSIONS + ' AND ' +
                     'Clicks >= ' + PLA_MIN_CLICKS + ' AND ' +
                     'Impressions >= ' + PLA_MIN_IMPRESSIONS;

  // All shopping search queries with associated data
  var shoppingSearchQueries = getShoppingSearchQueries(shoppingCampaignIds, kpiCondition);

  // All other search queries return in an array
  var textSearchQueries = getTextSearchQueries(shoppingCampaignIds);

  // Remove shopping queries that does exists in textSearchQueries
  var proposals = shoppingSearchQueries.data.filter(function(row){
    return textSearchQueries.indexOf(row.Query) === -1;
  });

  // Create a Spreadsheet
  var spreadsheet = createSpreadSheet(proposals);

  Logger.log('Spreadsheet created, you can access it here: ' + spreadsheet.getUrl());

}

/**
 * Creates a spreadsheet from an object. Will map keys in
 * the object with global variable COLUMNS
 *
 * @param  {object} data all the proposed new keywords
 * @return {object}      returns the spreadsheet object
 */
function createSpreadSheet(data) {
  var spreadsheet = SpreadsheetApp.create(REPORT_NAME);
  var sheet = spreadsheet.getActiveSheet();

  var sheetData = [];
  var headerRow = COLUMNS;

  for (var i = 0; i < data.length; i++) {
    var row = COLUMNS.map(function(key) {
      return data[i][key];
    });
    sheetData.push(row);
  }

  var cols = sheetData[0].length;
  var rows = sheetData.length;

  sheet.getRange(2, 1, 1, cols).setWrap(true).setValues([headerRow]);
  sheet.getRange(3, 1, rows, cols).setValues(sheetData);

  /**
  * Add some styling to the document
  * you can change the values as you like.
  */
  sheet.insertColumnBefore(1);
  sheet.setColumnWidth(1,15);
  sheet.deleteColumns(cols+2, sheet.getLastColumn()+2);
  sheet.setColumnWidth(cols+2, 15);

  // Header styling
  sheet.getRange(1, 1, 1, cols+2)
    .mergeAcross()
    .setBackground('#212d33')
    .setFontColor('#ffffff')
    .setFontSize(18)
    .setHorizontalAlignment('center')
    .setValue(REPORT_NAME);

  // Columns styling
  sheet.getRange(2, 1, 1, cols+2)
    .setBackground('#18BC9C')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Freeze the first two rows
  sheet.setFrozenRows(2);

  return spreadsheet;

}

/**
 * Get search query report for all your shopping campaigns
 *
 * @param  {array} ids            array with shopping campaign ids
 * @param  {string} kpiCondition  a where/and clause with kpi
 * @return {object}               search query data for shoppping campaings
 */
function getShoppingSearchQueries(ids, kpiCondition){
  var report = new AdWordsReport().awql()
    .select(COLUMNS)
    .from('SEARCH_QUERY_PERFORMANCE_REPORT')
    .where('CampaignId IN [' + ids.toString() + ']')
    .and(kpiCondition)
    .during(DATE_RANGE)
    .run();

  return report;
}

/**
 * Get search query report for all your none shopping campaigns
 *
 * @param  {array} ids      array with shopping campaign ids
 * @return {object}         search query data for none shopping campaigns
 */
function getTextSearchQueries(ids) {
  var report = new AdWordsReport().awql()
    .select('Query')
    .from('SEARCH_QUERY_PERFORMANCE_REPORT')
    .where('CampaignId NOT_IN [' + ids.toString() + ']')
    .during(DATE_RANGE)
    .run().data.map(function(row){
      return row.Query;
    });

  return report;
}

/**
 * Uses the AdWordsApp.shoppingCampaigns() to get all
 * shopping campaign ids
 *
 * @return {Array} arrawy with shopping campaign ids
 */
function getAllShoppingCampaignIds() {
  var shoppingCampaignIterator = AdWordsApp.shoppingCampaigns().get();
  var shoppingCampaignIds = [];
  while(shoppingCampaignIterator.hasNext()) {
    var shoppingCampaignId = shoppingCampaignIterator.next().getId();
    shoppingCampaignIds.push(shoppingCampaignId);
  }
  return shoppingCampaignIds;
}


var AdWordsReport=function(e){"use strict";e=e||{},e.exportToSheet=e.exportToSheet||!1,e.zeroImpression=e.zeroImpression||!0,e.lowImpressionShare=e.lowImpressionShare||.01,e.awqlOptions={};var r=[],t=function(e){return"--"===e?null:e.split(";").map(Function.prototype.call,String.prototype.trim)},i=function(e){return String(e)},n=function(r){return r=String(r),r.indexOf("<")>-1?e.lowImpressionShare:r.indexOf("%")>-1?Number(r.replace(/[%]/g,""))/100:"--"===r?Number(0):Number(r.replace(/,/g,""))},a={AccountCurrencyCode:i,AccountDescriptiveName:i,AccountTimeZoneId:i,ActiveViewCpm:n,ActiveViewImpressions:n,AdFormat:i,AdGroupAdDisapprovalReasons:t,AdGroupCount:n,AdGroupCreativesCount:n,AdGroupCriteriaCount:n,AdGroupCriterionStatus:i,AdGroupId:i,AdGroupName:i,AdGroupsCount:n,AdGroupStatus:i,AdId:i,AdNetworkType1:i,AdNetworkType2:i,AdType:i,AdvertiserExperimentSegmentationBin:i,AdvertiserPhoneNumber:i,AdvertisingChannelSubType:i,AdvertisingChannelType:i,AggregatorId:i,Amount:n,ApprovalStatus:i,AssociatedCampaignId:i,AssociatedCampaignName:i,AssociatedCampaignStatus:i,AttributeValues:t,AverageCpc:n,AverageCpm:n,AverageFrequency:n,AveragePageviews:n,AveragePosition:n,AverageTimeOnSite:n,AvgCostForOfflineInteraction:n,BenchmarkAverageMaxCpc:n,BenchmarkCtr:n,BiddingStrategyId:i,BiddingStrategyName:i,BiddingStrategyType:i,BidModifier:n,BidType:i,BounceRate:n,Brand:i,BudgetCampaignAssociationStatus:i,BudgetId:i,BudgetName:i,BudgetReferenceCount:n,BudgetStatus:i,CallDuration:n,CallEndTime:n,CallerCountryCallingCode:i,CallerNationalDesignatedCode:i,CallStartTime:n,CallStatus:i,CallType:i,CampaignCount:n,CampaignId:i,CampaignName:i,CampaignsCount:n,CampaignStatus:i,CanManageClients:i,Category0:i,Category1:i,Category2:i,CategoryL1:i,CategoryL2:i,CategoryL3:i,CategoryL4:i,CategoryL5:i,CategoryPaths:i,Channel:i,ChannelExclusivity:i,CityCriteriaId:i,ClickAssistedConversions:n,ClickAssistedConversionsOverLastClickConversions:n,ClickAssistedConversionValue:n,ClickConversionRate:n,ClickConversionRateSignificance:n,Clicks:n,ClickSignificance:n,ClickType:i,CombinedAdsOrganicClicks:n,CombinedAdsOrganicClicksPerQuery:n,CombinedAdsOrganicQueries:n,ContentBidCriterionTypeGroup:i,ContentBudgetLostImpressionShare:n,ContentImpressionShare:n,ContentRankLostImpressionShare:n,ConversionCategoryName:i,ConversionManyPerClickSignificance:n,ConversionRateManyPerClick:n,ConversionRateManyPerClickSignificance:n,ConversionsManyPerClick:n,ConversionTrackerId:i,ConversionTypeName:i,ConversionValue:n,ConvertedClicks:n,ConvertedClicksSignificance:n,Cost:n,CostPerConversionManyPerClick:n,CostPerConversionManyPerClickSignificance:n,CostPerConvertedClick:n,CostPerConvertedClickSignificance:n,CostPerEstimatedTotalConversion:n,CostSignificance:n,CountryCriteriaId:i,CpcBid:i,CpcBidSource:i,CpcSignificance:n,CpmBid:n,CpmBidSource:i,CpmSignificance:n,CreativeApprovalStatus:i,CreativeDestinationUrl:i,CreativeFinalAppUrls:t,CreativeFinalMobileUrls:t,CreativeFinalUrls:t,CreativeId:i,CreativeTrackingUrlTemplate:i,CreativeUrlCustomParameters:i,Criteria:i,CriteriaDestinationUrl:i,CriteriaId:i,CriteriaParameters:i,CriteriaStatus:i,CriteriaType:i,CriteriaTypeName:i,CriterionId:i,Ctr:n,CtrSignificance:n,CustomAttribute0:i,CustomAttribute1:i,CustomAttribute2:i,CustomAttribute3:i,CustomAttribute4:i,CustomerDescriptiveName:i,Date:i,DayOfWeek:i,DeliveryMethod:i,Description1:i,Description2:i,DestinationUrl:i,Device:i,DevicePreference:i,DisapprovalShortNames:t,DisplayName:i,DisplayUrl:i,DistanceBucket:i,Domain:i,EffectiveDestinationUrl:i,EndTime:i,EnhancedCpcEnabled:i,EstimatedCrossDeviceConversions:n,EstimatedTotalConversionRate:n,EstimatedTotalConversions:n,EstimatedTotalConversionValue:n,EstimatedTotalConversionValuePerClick:n,EstimatedTotalConversionValuePerCost:n,ExtensionPlaceholderCreativeId:i,ExtensionPlaceholderType:i,ExternalCustomerId:i,FeedId:i,FeedItemAttributes:t,FeedItemEndTime:i,FeedItemId:i,FeedItemStartTime:i,FeedItemStatus:i,FinalAppUrls:t,FinalMobileUrls:t,FinalUrls:t,FirstPageCpc:n,GclId:i,Headline:i,HourOfDay:n,Id:i,ImageAdUrl:i,ImageCreativeName:i,ImpressionAssistedConversions:n,ImpressionAssistedConversionsOverLastClickConversions:n,ImpressionAssistedConversionValue:n,ImpressionReach:n,Impressions:n,ImpressionSignificance:n,InvalidClickRate:n,InvalidClicks:n,IsAutoOptimized:i,IsAutoTaggingEnabled:i,IsBidOnPath:i,IsBudgetExplicitlyShared:i,IsNegative:i,IsPathExcluded:i,IsRestrict:i,IsSelfAction:i,IsTargetingLocation:i,IsTestAccount:i,KeywordId:i,KeywordMatchType:i,KeywordText:i,KeywordTextMatchingQuery:i,LabelId:i,LabelIds:t,LabelName:i,Labels:t,LanguageCriteriaId:i,Line1:i,LocationType:i,MatchType:i,MatchTypeWithVariant:i,MemberCount:n,MerchantId:i,MetroCriteriaId:i,Month:i,MonthOfYear:i,MostSpecificCriteriaId:i,Name:i,NonRemovedAdGroupCount:n,NonRemovedAdGroupCriteriaCount:n,NonRemovedCampaignCount:n,NumOfflineImpressions:n,NumOfflineInteractions:n,OfferId:i,OfflineInteractionCost:n,OfflineInteractionRate:n,OrganicAveragePosition:n,OrganicClicks:n,OrganicClicksPerQuery:n,OrganicImpressions:n,OrganicImpressionsPerQuery:n,OrganicQueries:n,Page:n,PageOnePromotedBidCeiling:n,PageOnePromotedBidChangesForRaisesOnly:i,PageOnePromotedBidModifier:n,PageOnePromotedRaiseBidWhenBudgetConstrained:i,PageOnePromotedRaiseBidWhenLowQualityScore:i,PageOnePromotedStrategyGoal:i,Parameter:i,ParentCriterionId:i,PartitionType:i,PercentNewVisitors:n,Period:i,PlaceholderType:n,PlacementUrl:i,PositionSignificance:n,PrimaryCompanyName:i,ProductCondition:i,ProductGroup:i,ProductTypeL1:i,ProductTypeL2:i,ProductTypeL3:i,ProductTypeL4:i,ProductTypeL5:i,QualityScore:n,Quarter:i,Query:i,ReferenceCount:n,RegionCriteriaId:i,RelativeCtr:n,Scheduling:i,SearchBudgetLostImpressionShare:n,SearchExactMatchImpressionShare:n,SearchImpressionShare:n,SearchQuery:i,SearchRankLostImpressionShare:n,SerpType:i,ServingStatus:i,SharedSetId:i,SharedSetName:i,SharedSetType:i,Slot:i,StartTime:i,Status:i,StoreId:i,TargetCpa:n,TargetCpaMaxCpcBidCeiling:n,TargetCpaMaxCpcBidFloor:n,TargetOutrankShare:n,TargetOutrankShareBidChangesForRaisesOnly:i,TargetOutrankShareCompetitorDomain:i,TargetOutrankShareMaxCpcBidCeiling:n,TargetOutrankShareRaiseBidWhenLowQualityScore:i,TargetRoas:n,TargetRoasBidCeiling:n,TargetRoasBidFloor:n,TargetSpendBidCeiling:n,TargetSpendSpendTarget:n,Title:i,TopOfPageCpc:n,TotalBudget:n,TotalCost:n,TrackingUrlTemplate:i,Trademarks:t,Type:i,Url:i,UrlCustomParameters:i,UserListId:i,UserListsCount:n,ValidationDetails:t,ValuePerConversionManyPerClick:n,ValuePerConvertedClick:n,ValuePerEstimatedTotalConversion:n,ViewThroughConversions:n,ViewThroughConversionsSignificance:n,Week:i,Year:i},o=function(e,r){var t={};return r.forEach(function(r){if(void 0!==a[r]){var i=e[r];t[r]=a[r](i)}}),t},s=function(r){return Array.isArray(r)&&(r=r.join(",")),e.awqlOptions.select=r,{from:d}},d=function(r){return e.awqlOptions.from=r,{where:l,and:C,during:c}},l=function(r){return e.awqlOptions.where=r,{and:C,during:c}},C=function(r){return e.awqlOptions.and||(e.awqlOptions.and=[]),Array.isArray(r)?e.awqlOptions.and=[].contact.apply([],e.awqlOptions.and,r):e.awqlOptions.and.push(r),{and:C,during:c}},c=function(r){return Array.isArray(r)&&(r=r.join(",")),e.awqlOptions.during=r,{run:p}},p=function(){var r=e.awqlOptions;"object"==typeof e.awqlOptions?(r="SELECT "+e.awqlOptions.select+" FROM "+e.awqlOptions.from,e.awqlOptions.where&&(r+=" WHERE "+e.awqlOptions.where),e.awqlOptions.and&&(r+=" AND "+e.awqlOptions.and.join(" AND ")),e.awqlOptions.during&&(r+=" DURING "+e.awqlOptions.during)):"string"==typeof r&&(r=r.split(", ").join(","));var t={includeZeroImpressions:e.zeroImpression};e.awqlOptions={};var i=AdWordsApp.report(r,t);return v(i)},u=function(){return r.length>0},g=function(){return r.splice(r.length-1,1)[0]},m=function(){return r.length>0?{hasNext:u,next:g}:void Logger.log("Cant use .rows() since there are no rows.")},v=function(t){var i={};i.rows=m,i.data=[];var n=(new Date).toLocaleDateString();if(e.exportToSheet){var a=SpreadsheetApp.create("AdWordsReport - "+n);t.exportToSheet(a.getActiveSheet()),i.sheetUrl=a.getUrl(),i.sheetId=a.getId(),i.sheetName=a.getName()}for(var s=t.rows();s.hasNext();){var d=s.next(),l=Object.keys(d),C=o(d,l);i.data.push(C)}return r=i.data,i};return this.use=function(r){if("object"!=typeof r)throw new Error("Wrong params in .use()");"boolean"==typeof r.exportToSheet&&(e.exportToSheet=r.exportToSheet),"boolean"==typeof r.zeroImpression&&(e.zeroImpression=r.zeroImpression),"number"==typeof r.lowImpressionShare&&(e.lowImpressionShare=r.lowImpressionShare)},this.awql=function(r){return r?(e.awqlOptions=r,Array.isArray(e.awqlOptions.select)&&(e.awqlOptions.select=e.awqlOptions.select.join(",")),Array.isArray(e.awqlOptions.during)&&(e.awqlOptions.during=e.awqlOptions.during.joing(",")),{run:p}):{select:s}},this};
