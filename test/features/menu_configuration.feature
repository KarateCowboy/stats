Feature: Intelligent menu

  Scenario: Reload the page and have my settings retained
    Given I am logged in to the system
    And there is a campaign with referral code "ABC123"
    And I view the Daily Active Users by Platform report
    And I pick "365" days for the date range
    And I enter in the referal code "ABC123"
    When I refresh the page
    Then I should see "365" days for the date range
    And I should see the code "ABC123" in the referal code box

  @dev
  Scenario Outline: Search, find, and visit the page or report
    Given I am logged in to the system
    And I search the sidebar filter for <sidebar-title>
    Then I should see <menu-link-id> at the top of the sidebar list
    When I click the sidebar item <menu-link-id>
    Then I should see <path> in the url bar and the report title <report-title>

    Examples:
      | path                        | menu-link-id              | sidebar-title                                  | report-title                                               |
      | overview                    | mnOverview                | Overview                                       | Overview                                                   |
      | dnu_dau_retention           | mnDNUDAURetention         | Daily Retention                                | Daily Retention                                            |
      | weekly-retention            | weeklyRetention           | Retention Week / Week                          | Retention Week / Week                                      |
      | usage_month_agg             | mnUsageMonthAgg           | Monthly Active Users - MAU                     | Monthly Active Users (MAU)                                 |
      | usage_month                 | mnUsageMonth              | Monthly Active Users by Platform - MAU         | Monthly Active Users by Platform (MAU)                     |
      | usage_month_average_agg     | mnUsageMonthAverageAgg    | Monthly Average Daily Active Users - MAU       | Monthly Average Daily Active Users (MAU & DAU)             |
      | usage_month_average         | mnUsageMonthAverage       | Monthly Average Daily Active Users by Platform | Monthly Average Daily Active Users by Platform (MAU & DAU) |
      | usage_month_average_new_agg | mnUsageMonthAverageNewAgg | Monthly Average Daily New Users - MAU          | Monthly Average Daily New Users (MAU/DNU)                  |
      | usage_month_average_new     | mnUsageMonthAverageNew    | Monthly Average Daily New Users by Platform    | Monthly Average Daily New Users by Platform (MAU/DNU)      |
      | usage_agg                   | mnUsageAgg                | Daily Active Users - DAU                       | Daily Active Users (DAU)                                   |
      | usage                       | mnUsage                   | Daily Active Users by Platform - DAU           | Daily Active Users by Platform (DAU)                       |
      | dauCampaign                 | mnDAUCampaign             | Daily Active Users by Campaign                 | Daily Active Users by Campaign (DAU)                       |
      | usage_returning             | mnUsageReturning          | Daily Returning Active Users by Platform       | Daily Returning Active Users by Platform (DAU)             |
      | versions                    | mnVersions                | Daily Active Users by Version                  | Daily Active Users by Version (DAU)                        |
      | daily_new_users             | mnDailyNewUsers           | Daily New Users - DNU                          | Daily New Users (DNU)                                      |
      | daily_new_platform          | mnDailyNewPlatform        | Daily New Users by Platform - DNU              | Daily New Users by Platform (DNU)                          |
      | dnuCampaign                 | mnDNUCampaign             | Daily New Users by Campaign - DNU              | Daily New Users by Campaign (DNU)                          |
      | search                      | mnSearch                  | Search                                         | Search                                                     |
      | top_crashes                 | mnTopCrashes              | Top Crash Reasons                              | Top Crashes By Platform and Version                        |
      | recent_crashes              | mnRecentCrashes           | Recent Crashes                                 | Recent Crash Reports                                       |
      | development_crashes         | mnDevelopmentCrashes      | Development Crashes                            | Development Crash Reports                                  |
      | crash_ratio                 | mnCrashRatio              | Crash Ratios                                   | Crash Ratio By Platform and Version                        |
      | crashes_platform            | mnCrashes                 | Daily Crashes by Platform                      | Daily Crashes by Platform                                  |
      | crashes_platform_version    | mnCrashesVersion          | Daily Crashes by Version                       | Daily Crashes by Version                                   |
      | downloads                   | mnDownloads               | Downloads                                      | Downloads                                                  |
      | druCampaign                 | mnDRUCampaign             | Daily Returning Users by Campaign - DRU        | Daily Returning Users by Campaign (DRU)                    |

