Feature: Daily Active Users by Platform (DAU)

  Scenario: Winx64 Brave core usage
    Given I am logged in to the system
    And there are "100000" usages for the prior week
    And the brave core daily numbers have been crunched
    And I view the Daily Active Users by Platform report
    Then I should see "100000" usages spread over each day for the prior month
