// External Dependencies
import React, {Component} from 'react';

// Internal Dependencies
import './style.css';

class WpDataTable extends Component {

  static slug = 'DIVI_wpDataTable';

  mounted = false;
  shortcode = '[wpdatatable]';

  constructor(props) {
    super(props);
    this.state = {
      shortcode: this.shortcode
    };
  }

  createShortCode () {
    let shortcode = '[wpdatatable'
    let tableId = this.props.id;
    let export_file_name = this.props.export_file_name;
    let tablesCount = parseInt(this.props.table_array_length);

    if (tablesCount === 1) {
      return "Please create a wpDataTable first. You can find detailed instructions in our docs on this <a target='_blank' href='https://wpdatatables.com/documentation/general/features-overview/'>link</a>.";
    }

    if (!isNumeric(tableId)) {
      tableId = tableId.substring(tableId.lastIndexOf('(id: ') + 4);
      tableId = tableId.substring(0, tableId.lastIndexOf(')'));
    }

    if (!parseInt(tableId)) {
      return 'Please select a wpDataTable.';
    }
    shortcode += ' id=' + tableId;
    if (export_file_name) {
      shortcode += ' export_file_name=' + export_file_name;
    }
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

export default WpDataTable;
