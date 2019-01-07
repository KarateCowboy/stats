Feature: Daily Active Users by Version Report

  Background:
    Given I am logged in to the system

  Scenario: View rows of stats for all version/platforms
    Given there are usages for all platforms and multiple versions for the last week
    When I view the Daily Active Users by Version report
    Then I should see DAU data for all the platforms, broken down by version
