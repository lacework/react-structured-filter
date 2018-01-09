var React = require('react');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = React.createClass({
    propTypes: {
        children: React.PropTypes.object,
        onRemove: React.PropTypes.func
    },

    render: function() {
        let title = `${this.props.children["category"]} ${this.props.children["operator"]} "${this.props.children["value"]}"`;
        return (
            <div {...this.props} className="typeahead-token" title={title}>
                {this.props.children["category"]} {this.props.children["operator"]} "{this.props.children["value"]}"
                {this._makeCloseButton()}
            </div>
        );
    },

    _makeCloseButton: function() {
        if (!this.props['data-onRemove']) {
            return "";
        }
        return (
            <a className="typeahead-token-close icon-cancel-circled" href="#" onClick={function(event) {
                this.props['data-onRemove'](this.props.children);
                event.preventDefault();
            }.bind(this)}></a>
        );
    }
});

module.exports = Token;
