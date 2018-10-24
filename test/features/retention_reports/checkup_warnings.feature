Feature: Warnings and checkups for retention reports

  Scenario Outline: Missing an entire platform
    Given I am logged in to the system
    Given there is a complete retention run in the retention table
    And "<platform>" retention data is missing
    And I view the Retention Week / Week report
    Then I should see a warning about the missing "<platform>" platform data

    Examples:
      | platform       |
      | androidbrowser |
      | osx            |
      | ios            |
      | winx64-bc      |

