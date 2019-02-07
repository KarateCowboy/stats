Feature: Intelligent menu

  Scenario: Reload the page and have my settings retained
    Given I am logged in to the system
    And there is a campaign with referral code "ABC123"
    And I view the Daily Active Users by Platform report
    And I pick "365" days for the date range
    And I enter in the referal code "ABC123"
    When I refresh the page
    Then I should see "365" days for the date range
    And I should see the code "ABC123" in the referal code box
