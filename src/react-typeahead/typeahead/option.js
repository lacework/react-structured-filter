//var React = window.React || require('react/addons');
var React = require('react');
var cx = require('classnames');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = createReactClass({
    propTypes: {
        customClasses: PropTypes.object,
        onClick: PropTypes.func,
        children: PropTypes.string
    },

    getDefaultProps: function() {
        return {
            customClasses: {},
            onClick: function(event) {
                event.preventDefault();
            }
        };
    },

    getInitialState: function() {
        return {
            hover: false
        };
    },

    render: function() {
        var classes = {
            hover: this.props.hover
        }
        classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;
        //var classList = React.addons.classSet(classes);
        var classList = cx(classes);

        return (
            <li className={classList} onClick={this._onClick}>
              <a className={this._getClasses()} ref="anchor">
                  { this.props.children }
              </a>
            </li>
        );
    },

    _getClasses: function() {
        var classes = {
            "typeahead-option": true,
        };
        classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;
        //return React.addons.classSet(classes);
        return cx(classes);
    },

    _onClick: function() {
        return this.props.onClick();
    }
});


module.exports = TypeaheadOption;
