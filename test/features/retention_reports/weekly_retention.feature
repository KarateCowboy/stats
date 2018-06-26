Feature: A report that shows weekly retention and usage rates. The period is the first three months following initial
  installation of the Brave browser. The purpose of this report is to see, in granularity, the amount of people who continue
  or stop using the browser after initial installation.

  Scenario: I open the report
    Given I am logged in to the system
    And I click the menu item for weekly retention
    Then I should see the report page for weekly retention

  Scenario: filter by ref
    Given I am logged in to the system
    And I view the recent weekly retention data
    Then I should be able to filter by referral code
