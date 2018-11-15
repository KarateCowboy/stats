Feature: Filter by referral code

  Scenario: Visit
    Given I am logged in to the system
    And there are "100000" mixed ref usages for the prior month
    And I view the Monthly Active Users report
    Then the ref select should be visible and have the 'none' ref entered
    And I enter an existing referral code in the text box
