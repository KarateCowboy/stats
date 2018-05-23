Feature: There should be a 'Today/This Month' button which allows the report to show partial, up to date stastics for the month


Scenario: Exists on the Daily Active Users by Platform (DAU) page
    Given I am logged in to the system
    And I go to the Daily Active Users by Platform Report
    Then I should see the Today/This Month button
