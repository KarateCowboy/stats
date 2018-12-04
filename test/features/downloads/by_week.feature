Feature: Analysis of downloads by week

  Scenario: Visit the page and see three weeks of data
    Given there are "3" weeks of "androidbrowser" downloads
    And there are "3" weeks of "winx64-bc" downloads
    And there are "3" weeks of "ios" downloads
    And there are "3" weeks of "linux" downloads
    And I am logged in to the system
    And I view the Downloads page
    Then I should see a column and count for each type and week
