/*****************************************************************************
 * Open MCT Web, Copyright (c) 2014-2015, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT Web is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT Web includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/
/*global define*/

define(
    [],
    function () {
        "use strict";

        var CONDUCTOR_HEIGHT = "100px",
            TEMPLATE = [
                '<div style=',
                '"position: absolute; bottom: 0; width: 100%; ',
                'overflow: hidden; ',
                'height: ' + CONDUCTOR_HEIGHT + '">',
                "<mct-include key=\"'time-controller'\" ng-model='conductor'>",
                "</mct-include>",
                '</div>'
            ].join(''),
            GLOBAL_SHOWING = false;

        /**
         * The ConductorRepresenter attaches the universal time conductor
         * to views.
         *
         * @memberof platform/commonUI/edit
         * @implements {Representer}
         * @constructor
         */
        function ConductorRepresenter($interval, conductorService, $compile, views, scope, element) {
            var conductorScope;

            // Angular doesn't like objects to retain references to scope
            this.getScope = function () { return scope; };
            this.conductorScope = function (s) {
                return (conductorScope = arguments.length > 0 ? s : conductorScope);
            };

            this.conductorService = conductorService;
            this.element = element;
            this.showing = false;
            this.views = views;
            this.$compile = $compile;
            this.$interval = $interval;

            this.originalHeight = element.css('height');
            this.hadAbs = element.hasClass('abs');
        }

        // Update the time conductor from the scope
        ConductorRepresenter.prototype.wireScope = function () {
            var scope = this.conductorScope(),
                conductor = this.conductorService.getConductor(),
                self = this;

            function updateConductorOuter() {
                conductor.queryStart(scope.conductor.outer[0]);
                conductor.queryEnd(scope.conductor.outer[1]);
                self.getScope().$broadcast('telemetry:query:bounds', {
                    start: conductor.queryStart(),
                    end: conductor.queryEnd()
                });
            }

            function updateConductorInner() {
                conductor.displayStart(scope.conductor.inner[0]);
                conductor.displayEnd(scope.conductor.inner[1]);
                self.getScope().$broadcast('telemetry:display:bounds', {
                    start: conductor.displayStart(),
                    end: conductor.displayEnd()
                });
            }

            scope.conductor = {
                outer: [ conductor.queryStart(), conductor.queryEnd() ],
                inner: [ conductor.displayStart(), conductor.displayEnd() ]
            };

            scope.$watch('conductor.outer[0]', updateConductorOuter);
            scope.$watch('conductor.outer[1]', updateConductorOuter);
            scope.$watch('conductor.inner[0]', updateConductorInner);
            scope.$watch('conductor.inner[1]', updateConductorInner);
        };

        // Handle a specific representation of a specific domain object
        ConductorRepresenter.prototype.represent = function represent(representation, representedObject) {
            this.destroy();

            if (this.views.indexOf(representation) !== -1 && !GLOBAL_SHOWING) {
                // Create a new scope for the conductor
                this.conductorScope(this.getScope().$new());
                this.wireScope();
                this.conductorElement =
                    this.$compile(TEMPLATE)(this.conductorScope());
                this.element.after(this.conductorElement[0]);
                this.element.addClass('abs');
                this.element.css('bottom', CONDUCTOR_HEIGHT);
                this.showing = true;
                GLOBAL_SHOWING = true;
            }
        };

        // Respond to the destruction of the current representation.
        ConductorRepresenter.prototype.destroy = function destroy() {
            // We may not have decided to show in the first place,
            // so circumvent any unnecessary cleanup
            if (!this.showing) {
                return;
            }

            // Restore the original size of the mct-representation
            if (!this.hadAbs) {
                this.element.removeClass('abs');
            }
            this.element.css('height', this.originalHeight);

            // ...and remove the conductor
            if (this.conductorElement) {
                this.conductorElement.remove();
                this.conductorElement = undefined;
            }

            // Finally, destroy its scope
            if (this.conductorScope()) {
                this.conductorScope().$destroy();
                this.conductorScope(undefined);
            }

            this.showing = false;
            GLOBAL_SHOWING = false;
        };

        return ConductorRepresenter;
    }
);
