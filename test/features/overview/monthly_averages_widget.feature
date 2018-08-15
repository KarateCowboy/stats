Feature: Monthly Averages widget on Overview panel

  Scenario: View monthly averages for core desktop
    Given there are core usages for the last six months
    And I am logged in to the system
    Then I should see the averages laid out for the core usages