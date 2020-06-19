//var React = window.React || require('react/addons');
var React = require('react');
var TypeaheadOption = require('./option');
var cx = require('classnames');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
var TypeaheadSelector = createReactClass({
    propTypes: {
        options: PropTypes.array,
        header: PropTypes.string,
        customClasses: PropTypes.object,
        errorMsg: PropTypes.string,
        selectionIndex: PropTypes.number,
        onOptionSelected: PropTypes.func
    },

    getDefaultProps: function() {
        return {
            selectionIndex: null,
            customClasses: {},
            onOptionSelected: function(option) { }
        };
    },

    getInitialState: function() {
        return {
            selectionIndex: this.props.selectionIndex,
            selection: this.getSelectionForIndex(this.props.selectionIndex)
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({selectionIndex: null});
    },

    render: function() {
        var classes = {
            "typeahead-selector": true
        };
        classes[this.props.customClasses.results] = this.props.customClasses.results;
        //var classList = React.addons.classSet(classes);
        var classList = cx(classes);
        var showErrorMsg = null;
        if (this.props.errorMsg) {
            showErrorMsg = (
                <li className="error">{this.props.errorMsg}</li>
            );
        }

        var results = this.props.options.map(function(result, i) {
            return (
                <TypeaheadOption ref={result} key={result}
                                 hover={this.state.selectionIndex === i}
                                 customClasses={this.props.customClasses}
                                 onClick={this._onClick.bind(this, result)}>
                    { result }
                </TypeaheadOption>
            );
        }, this);
        return <ul className={classList}>
          <li className="header">{this.props.header}</li>
            { showErrorMsg }
            { results }
        </ul>;
    },

    setSelectionIndex: function(index) {
        this.setState({
            selectionIndex: index,
            selection: this.getSelectionForIndex(index),
        });
    },

    getSelectionForIndex: function(index) {
        if (index === null) {
            return null;
        }
        return this.props.options[index];
    },

    _onClick: function(result) {
        this.props.onOptionSelected(result);
    },

    _nav: function(delta) {

        let filterContainer = document.getElementsByClassName('filter-tokenizer-list__container')[0];
        let listItem = document.getElementsByClassName('filter-tokenizer-list__item')[0];
        var elemHeight = listItem.clientHeight;
        let scrollValue = Math.ceil(filterContainer.scrollTop);

        if(delta == 1){
            filterContainer.scrollTop = scrollValue+elemHeight;
        } else{
            filterContainer.scrollTop = scrollValue-elemHeight;
        }

        if (!this.props.options) {
            return;
        }
        var newIndex;
        if (this.state.selectionIndex === null) {
            if (delta == 1) {
                newIndex = 0;
            } else {
                newIndex = delta;
            }
        } else {
            newIndex = this.state.selectionIndex + delta;
        }
        if (newIndex < 0) {
            newIndex += this.props.options.length;
            filterContainer.scrollTop = this.props.options.length*elemHeight;
        } else if (newIndex >= this.props.options.length) {
            newIndex -= this.props.options.length;
            filterContainer.scrollTop = 0;
        }
        var newSelection = this.getSelectionForIndex(newIndex);
        this.setState({selectionIndex: newIndex, selection: newSelection});
    },

    navDown: function() {
        this._nav(1);
    },

    navUp: function() {
        this._nav(-1);
    }

});

module.exports = TypeaheadSelector;
