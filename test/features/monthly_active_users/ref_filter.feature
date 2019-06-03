Feature: Filter by referral code

  Background:
    Given there are "100000" mixed ref usages for the prior month
    And I am logged in to the system

  @smoketest-pass
  Scenario: Use with MAU
    And I view the Monthly Active Users report
    Then the ref select should be visible and have no ref entered
    And I enter an existing referral code in the text box
    Then the report should limit to the existing referrals statistics
    When I clear the ref filter box
    Then I should see MAU for all referral codes

  @smoketest-pass 
  Scenario: Use with MAU by platform
    And I view the Monthly Active Users by Platform report
    Then the ref select should be visible and have no ref entered
    And I enter an existing referral code in the text box
    Then the report should limit to the existing referrals statistics
    When I clear the ref filter box
    Then I should see MAU for all referral codes

  @smoketest-pass
  Scenario: Use with Monthly Average DAU
    And I view the Monthly Average Daily Active Users report
    Then the ref select should be visible and have no ref entered
    And I enter an existing referral code in the text box
    Then the report should show only the average dau for that referral code
    When I clear the ref filter box
    Then I should see monthly average for all referral codes

  @smoketest-pass
  Scenario: Use with Monthly Average DAU by Platform
    And I view the Monthly Average Daily Active Users by Platform report
    Then the ref select should be visible and have no ref entered
    And I enter an existing referral code in the text box
    Then the report should show only the average dau for that referral code
    When I clear the ref filter box
    Then I should see monthly average for all referral codes

  @smoketest-pass
  Scenario: Use with Monthly Average Daily New users
    And I view the Monthly Average Daily New Users report
    Then the ref select should be visible and have no ref entered
    And I enter an existing referral code in the text box
    Then the report should show only the average dau for that referral code
    When I clear the ref filter box
    Then I should see monthly average for all referral codes

