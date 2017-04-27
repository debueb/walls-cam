var React = require('react');

module.exports = React.createClass({
  displayName: 'Header',

  render: function () {
    return (
      <div className="text">
    		<span className="logo"></span>
    		<span className="cam"></span>
      </div>
		)
	}

});


