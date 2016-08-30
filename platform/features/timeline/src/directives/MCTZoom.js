/*****************************************************************************
 * Open MCT, Copyright (c) 2009-2016, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
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
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

define(
    [],
    function() {
        function MCTZoom() {
            function link(scope, element, attrs) {
                // Bind to the mouse wheel scroll event
                element.bind("DOMMouseScroll mousewheel onmousewheel", function(event) {
                    // Determine the direction the mouse wheel was turned
                    var zoomDirection = event.wheelDelta > 0 ? -1 : 1;

                    // Call the zoom callback in order to perform the zoom in the controller
                    scope.zoomCallback({arg1: zoomDirection});
                });
            }

            return {
                // Applies to attributes
                restrict: "A",
                // Add the zoom callback to the scope
                scope: { zoomCallback: '&mctZoomCallback' },
                // Link using above function
                link: link
            };
        }

        return MCTZoom;
    }
);