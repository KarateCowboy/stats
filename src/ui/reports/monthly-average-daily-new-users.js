const BaseReportComponent = require('../base-report-component')
const $ = require('jquery')

class MonthlyAverageDailyNewUsers extends BaseReportComponent {
    constructor() {
        super()
        this.title = 'Monthly Average Daily New Users (MAU/DNU)'
        this.subtitle = ''
        this.path = 'usage_month_average_new_agg'
        this.menuTitle = 'Monthly Average Daily New Users - MAU & DNU'
        this.menuId = 'usageMonthAverageNewAgg'
        this.reportContent = `<marquee>Monthly Average Users Content</marquee>`
        this.contentTagId = 'usageContent'
        this.menuConfig.showWOISFilter = false
        this.menuConfig.showCountryCodeFilter = false

    }

    async retriever() {
        let results
        try {
            results = await $.ajax('/api/1/dau_first_monthly_average?' + $.param(this.app.pageState.standardParams()))
            this.handler(results)
        } catch (e) {
            console.log(`Error running retriever for ${this.title}`)
            console.log(e.message)
        }
    }

    handler(data) {
        const handler = BaseReportComponent.buildSuccessHandler('ymd', 'platform', 'Date', 'Platform', {colourBy: 'label'})
        handler(data)
        $(`#${this.contentTagId}`).show()
    }
}

module.exports = MonthlyAverageDailyNewUsers