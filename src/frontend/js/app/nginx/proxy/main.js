'use strict';

const Mn             = require('backbone.marionette');
const ProxyHostModel = require('../../../models/proxy-host');
const Api            = require('../../api');
const Controller     = require('../../controller');
const ListView       = require('./list/main');
const ErrorView      = require('../../error/main');
const template       = require('./main.ejs');
const EmptyView      = require('../../empty/main');

module.exports = Mn.View.extend({
    id:       'nginx-proxy',
    template: template,

    ui: {
        list_region: '.list-region',
        add:         '.add-item',
        dimmer:      '.dimmer'
    },

    regions: {
        list_region: '@ui.list_region'
    },

    events: {
        'click @ui.add': function (e) {
            e.preventDefault();
            Controller.showNginxProxyForm();
        }
    },

    onRender: function () {
        let view = this;

        Api.Nginx.ProxyHosts.getAll()
            .then(response => {
                if (!view.isDestroyed()) {
                    if (response && response.length) {
                        view.showChildView('list_region', new ListView({
                            collection: new ProxyHostModel.Collection(response)
                        }));
                    } else {
                        view.showChildView('list_region', new EmptyView({
                            title:     'There are no Proxy Hosts',
                            subtitle:  'Why don\'t you create one?',
                            link:      'Add Proxy Host',
                            btn_color: 'success',
                            action:    function () {
                                Controller.showNginxProxyForm();
                            }
                        }));
                    }
                }
            })
            .catch(err => {
                view.showChildView('list_region', new ErrorView({
                    code:    err.code,
                    message: err.message,
                    retry:   function () {
                        Controller.showNginxProxy();
                    }
                }));

                console.error(err);
            })
            .then(() => {
                view.ui.dimmer.removeClass('active');
            });
    }
});
