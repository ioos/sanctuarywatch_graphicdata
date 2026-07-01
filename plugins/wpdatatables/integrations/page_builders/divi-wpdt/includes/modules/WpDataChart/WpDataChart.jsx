// External Dependencies
import React, {Component} from 'react';

// Internal Dependencies
import './style.css';

class WpDataChart extends Component {

    static slug = 'DIVI_wpDataChart';

    mounted = false;
    shortcode = '[wpdatachart]';

    constructor(props) {
        super(props);
        this.state = {
            shortcode: this.shortcode
        };
    }

    createShortCode () {
        let shortcode = '[wpdatachart'
        let chartId = this.props.id;
        let chartsCount = parseInt(this.props.chart_array_length);

        if (!isNumeric(chartId)) {
            chartId = chartId.substring(chartId.lastIndexOf('(id: ') + 4);
            chartId = chartId.substring(0, chartId.lastIndexOf(')'));
        }

        if (chartsCount === 1) {
            return "Please create a wpDataChart first. You can check out how on this <a target='_blank' href='https://wpdatatables.com/documentation/wpdatacharts/creating-charts-wordpress-wpdatachart-wizard/'>link</a>.";
        }
        if (!parseInt(chartId)) {
            return 'Please select a wpDataChart.';
        }
        shortcode += ' id=' + chartId;
        shortcode += ']'
        return shortcode
    }

    componentDidMount () {
        this.mounted = true
        if (this.mounted) {
            this.shortcode = this.createShortCode()
            this.setState({
                shortcode: this.shortcode
            })
        }
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
        if (this.mounted) {
            this.shortcode = this.createShortCode()
            if (prevState.shortcode !== this.shortcode) {
                this.setState({
                    shortcode: this.shortcode
                })
            }
        }
    }

    componentWillUnmount () {
        this.mounted = false
    }

    render () {
        return (
            <div dangerouslySetInnerHTML={{ __html: this.shortcode }}/>
        )
    }

}

function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}

export default WpDataChart;
