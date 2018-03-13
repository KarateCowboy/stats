Feature: A report that shows weekly retention and usage rates. The period is the first three months following initial
  installation of the Brave browser. The purpose of this report is to see, in granularity, the amount of people who continue
  or stop using the browser after initial installation.

  Scenario: I open the report
    Given I am logged in to the system
    And I click the menu item for monthly retention
    Then I should see the report page for monthly retention