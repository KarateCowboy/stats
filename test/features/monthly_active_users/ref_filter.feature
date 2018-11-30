Feature: Filter by referral code
  Background:
    Given there are "100000" mixed ref usages for the prior month
    And I am logged in to the system

  Scenario: Use with MAU
    And I view the Monthly Active Users report
    Then the ref select should be visible and have the 'none' ref entered
    And I enter an existing referral code in the text box
    Then the report should limit to the existing referrals statistics

  Scenario: Use with MAU by platform
    And I view the Monthly Active Users by Platform report
    Then the ref select should be visible and have the 'none' ref entered
    And I enter an existing referral code in the text box
    Then the report should limit to the existing referrals statistics

  @dev
  Scenario: Use with Monthly Average DAU
    And I view the Monthly Average Daily Active Users report
    Then the ref select should be visible and have the 'none' ref entered
    And I enter an existing referral code in the text box
    Then the report should show only the average dau for that referral code
    
