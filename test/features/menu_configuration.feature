Feature: Intelligent menu

  Scenario Outline: Search, find, and visit the page or report
    Given I am logged in to the system
    And I search the sidebar filter for <sidebar-title>
    Then I should see <menu-link-id> at the top of the sidebar list
    When I click the sidebar item <menu-link-id>
    Then I should see <path> in the url bar and the report title <report-title>

    Examples:
      | path                        | menu-link-id            | sidebar-title                                  | report-title                                               |
      | overView                    | overview                | Overview                                       | Overview                                                   |
      | dnu_dau_retention           | dailyRetention          | Daily Retention                                | Daily Retention                                            |
      | weekly-retention            | weeklyRetention         | Retention Week / Week                          | Retention Week / Week                                      |
      | usage_month_agg             | usageMonthAgg           | Monthly Active Users - MAU                     | Monthly Active Users (MAU)                                 |
      | usage_month                 | usageMonth              | Monthly Active Users by Platform - MAU         | Monthly Active Users by Platform (MAU)                     |
      | usage_month_average_agg     | usageMonthAverageAgg    | Monthly Average Daily Active Users - MAU       | Monthly Average Daily Active Users (MAU & DAU)             |
      | usage_month_average         | usageMonthAverage       | Monthly Average Daily Active Users by Platform | Monthly Average Daily Active Users by Platform (MAU & DAU) |
      | usage_month_average_new_agg | usageMonthAverageNewAgg | Monthly Average Daily New Users - MAU          | Monthly Average Daily New Users (MAU/DNU)                  |
      | usage_month_average_new     | usageMonthAverageNew    | Monthly Average Daily New Users by Platform    | Monthly Average Daily New Users by Platform (MAU/DNU)      |
      | usage_agg                   | usageAgg                | Daily Active Users - DAU                       | Daily Active Users (DAU)                                   |
      | usage                       | usage                   | Daily Active Users by Platform - DAU           | Daily Active Users by Platform (DAU)                       |
      | dauCampaign                 | dauCampaign             | Daily Active Users by Campaign                 | Daily Active Users by Campaign (DAU)                       |
      | usage_returning             | usageReturning          | Daily Returning Active Users by Platform       | Daily Returning Active Users by Platform (DAU)             |
      | versions                    | versions                | Daily Active Users by Version                  | Daily Active Users by Version (DAU)                        |
      | daily_new_users             | dailyNewUsers           | Daily New Users - DNU                          | Daily New Users (DNU)                                      |
      | daily_new_platform          | dailyNewPlatform        | Daily New Users by Platform - DNU              | Daily New Users by Platform (DNU)                          |
      | dnuCampaign                 | dnuCampaign             | Daily New Users by Campaign - DNU              | Daily New Users by Campaign (DNU)                          |
      | search                      | search                  | Search                                         | Search                                                     |
      | top_crashes                 | topCrashes              | Top Crash Reasons                              | Top Crashes by Platform and Version                        |
      | recent_crashes              | recentCrashes           | Recent Crashes                                 | Recent Crash Reports                                       |
      | development_crashes         | developmentCrashes      | Development Crashes                            | Development Crash Reports                                  |
      | crash_ratio                 | crashRatio              | Crash Ratios                                   | Crash Ratio by Platform and Version                        |
      | crashes_platform            | crashes                 | Daily Crashes by Platform                      | Daily Crashes by Platform                                  |
      | crashes_platform_version    | crashesVersion          | Daily Crashes by Version                       | Daily Crashes by Version                                   |
      | downloads                   | downloads               | Downloads                                      | Downloads                                                  |
      | druCampaign                 | druCampaign             | Daily Returning Users by Campaign - DRU        | Daily Returning Users by Campaign (DRU)                    |
      | dauCampaign                 | dauCampaign             | Daily Active Users by Campaign - DAU           | Daily Active Users by Campaign (DAU)                       |
      | dnuCampaign                 | dnuCampaign             | Daily New Users by Campaign - DNU              | Daily New Users by Campaign (DNU)                          |
      | dailyPublishers             | dailyPublishers         | Daily Publishers                               | Daily Publishers                                           |
      | dailyPublishersAgg          | dailyPublishersAgg      | Daily Publishers Aggregated                    | Daily Publishers Aggregated                                |
      | usage_month_pacing          | usageMonthPacing        | Monthly Active Users - Pacing - MAU            | Monthly Active Users (Pacing) (MAU)                        |
      | p3a                         | p3a                     | P3A                                            | P3A                                                        |
