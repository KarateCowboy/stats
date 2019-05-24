$ = require('jquery')
global.menu = {
  COUNTRIES: require('../isomorphic/countries'),
  WOIS: require('../isomorphic/wois')
}
require('./color')
require('./brave-menu')
require('./brave-menu-api')
require('./referral')
const Application = require('./application')

const OverviewReport = require('./reports/overview')
const DailyRetention = require('./reports/daily-retention')
const WeeklyRetention = require('./reports/weekly-retention')
const ThirtyDayRetention = require('./reports/thirty-day-retention')
const MonthlyActiveUsers = require('./reports/monthly-active-users')
const MonthlyReturningUsers = require('./reports/monthly-returning-users')
const MonthlyReturningUsersByPlatform = require('./reports/monthly-returning-users-by-platform')
const MonthlyActiveUsersByPlatform = require('./reports/monthly-active-users-by-platform')
const MonthlyAverageDailyActiveUsers = require('./reports/monthly-average-daily-active-users')
const MonthlyAverageDailyActiveUsersByPlatform = require('./reports/monthly-average-daily-active-users-by-platform')
const MonthlyAverageDailyNewUsers = require('./reports/monthly-average-daily-new-users')
const MonthlyAverageDailyNewUsersByPlatform = require('./reports/monthly-average-daily-new-users-by-platform')
const DailyActiveUsers = require('./reports/daily-active-users')
const DailyActiveUsersByPlatform = require('./reports/daily-active-users-by-platform')
const DailyActiveUsersByCountry = require('./reports/daily-active-users-by-country')
const DailyActiveUsersByCampaign = require('./reports/daily-active-users-by-campaign')
const DailyReturningUsersByCampaign = require('./reports/daily-returning-users-by-campaign')
const DailyReturningActiveUsersByPlatform = require('./reports/daily-returning-active-users-by-platform')
const DailyActiveUsersByVersion = require('./reports/daily-active-users-by-version')
const DailyNewUsers = require('./reports/daily-new-users')
const DailyNewUsersByPlatform = require('./reports/daily-new-users-by-platform')
const DailyNewUsersByCampaign = require('./reports/daily-new-users-by-campaign')
const DailyPublishers = require('./reports/daily-publishers')
const DailyPublishersAgg = require('./reports/daily-publishers-aggregated')
const SearchCrashes = require('./reports/search-crashes')
const CrashDetails = require('./reports/crash-details')
const TopCrashReasons = require('./reports/top-crash-reasons')
const RecentCrashes = require('./reports/recent-crashes')
const DevelopmentCrashes = require('./reports/development-crashes')
const CrashRatios = require('./reports/crash-ratios')
const DailyCrashesByPlatform = require('./reports/daily-crashes-by-platform')
const DailyCrashesByVersion = require('./reports/daily-crashes-by-version')
const Downloads = require('./reports/downloads')

global.init = async function () {

  let priorState = null
  
  let storedStateData = await window.localStorage.getItem('pageState')
  if (storedStateData) {
    priorState = JSON.parse(storedStateData)
  }
  global.app = new Application([
    (new OverviewReport()),
    (new DailyRetention()),
    (new WeeklyRetention()),
    (new ThirtyDayRetention()),
    (new MonthlyActiveUsers()),
    (new MonthlyActiveUsersByPlatform()),
    (new MonthlyAverageDailyActiveUsers()),
    (new MonthlyAverageDailyActiveUsersByPlatform()),
    (new MonthlyAverageDailyNewUsers()),
    (new MonthlyAverageDailyNewUsersByPlatform()),
    (new MonthlyReturningUsers()),
    (new MonthlyReturningUsersByPlatform()),
    (new DailyActiveUsers()),
    (new DailyActiveUsersByPlatform()),
    (new DailyActiveUsersByCountry()),
    (new DailyActiveUsersByCampaign()),
    (new DailyReturningUsersByCampaign()),
    (new DailyReturningActiveUsersByPlatform()),
    (new DailyActiveUsersByVersion()),
    (new DailyNewUsers()),
    (new DailyNewUsersByPlatform()),
    (new DailyNewUsersByCampaign()),
    (new DailyPublishers()),
    (new DailyPublishersAgg()),
    (new SearchCrashes()),
    (new CrashDetails()),
    (new TopCrashReasons()),
    (new RecentCrashes()),
    (new DevelopmentCrashes()),
    (new CrashRatios()),
    (new DailyCrashesByPlatform()),
    (new DailyCrashesByVersion()),
    (new Downloads())
  ], priorState)

}

/*
require('./stats')
require('./publishers')
require('./searchLinks')
require('./correlation')
*/
