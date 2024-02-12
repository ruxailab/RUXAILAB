# Copyright 2022 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# pylint: disable=protected-access
"""
Cloud functions to handle Firebase App Distribution events from Firebase Alerts.
"""
import dataclasses as _dataclasses
import functools as _functools
import typing as _typing
import cloudevents.http as _ce
from firebase_functions.alerts import FirebaseAlertData

import firebase_functions.private.util as _util

from firebase_functions.core import T, CloudEvent
from firebase_functions.options import AppDistributionOptions


@_dataclasses.dataclass(frozen=True)
class NewTesterDevicePayload:
    """
    The internal payload object for adding a new tester device to app distribution.
    Payload is wrapped inside a `FirebaseAlertData` object.
    """

    tester_name: str
    """
    Name of the tester.
    """

    tester_email: str
    """
    Email of the tester.
    """

    tester_device_model_name: str
    """
    The device model name.
    """

    tester_device_identifier: str
    """
    The device ID.
    """


@_dataclasses.dataclass(frozen=True)
class InAppFeedbackPayload:
    """
    The internal payload object for receiving in-app feedback from a tester.
    Payload is wrapped inside a `FirebaseAlertData` object.
    """

    feedback_report: str
    """
    Resource name. Format: 
    `projects/{project_number}/apps/{app_id}/releases/{release_id}/feedbackReports/{feedback_id}`
    """

    feedback_console_uri: str
    """
    Deep link back to the Firebase console.
    """

    tester_email: str
    """
    Email of the tester.
    """

    app_version: str
    """
    Version consisting of `versionName` and `versionCode` for Android and
    `CFBundleShortVersionString` and `CFBundleVersion` for iOS.
    """

    text: str
    """
    Text entered by the tester.
    """

    tester_name: str | None = None
    """
    Name of the tester.
    """

    screenshot_uri: str | None = None
    """
    URI to download screenshot. This URI is fast expiring.
    """


@_dataclasses.dataclass(frozen=True)
class AppDistributionEvent(CloudEvent[FirebaseAlertData[T]]):
    """
    A custom CloudEvent for billing Firebase Alerts.
    """

    alert_type: str
    """
    The type of the alerts that got triggered.
    """

    app_id: str
    """
    The Firebase App ID that's associated with the alert.
    """


NewTesterDeviceEvent = AppDistributionEvent[NewTesterDevicePayload]
"""
The type of the event for 'on_new_tester_ios_device_published' functions.
"""

InAppFeedbackEvent = AppDistributionEvent[InAppFeedbackPayload]
"""
The type of the event for 'on_in_app_feedback_published' functions.
"""

OnNewTesterIosDevicePublishedCallable = _typing.Callable[[NewTesterDeviceEvent],
                                                         None]
"""
The type of the callable for 'on_new_tester_ios_device_published' functions.
"""

OnInAppFeedbackPublishedCallable = _typing.Callable[[InAppFeedbackEvent], None]
"""
The type of the callable for 'on_in_app_feedback_published' functions.
"""


@_util.copy_func_kwargs(AppDistributionOptions)
def on_new_tester_ios_device_published(
    **kwargs
) -> _typing.Callable[[OnNewTesterIosDevicePublishedCallable],
                      OnNewTesterIosDevicePublishedCallable]:
    """
    Event handler which runs every time a new tester iOS device is added.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.app_distribution_fn as app_distribution_fn   

      @app_distribution_fn.on_new_tester_ios_device_published()
      def example(alert: app_distribution_fn.NewTesterDeviceEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.AppDistributionOptions`
    :rtype: :exc:`typing.Callable`
            \\[ 
            \\[ :exc:`firebase_functions.alerts.app_distribution_fn.NewTesterDeviceEvent` \\], 
            `None` 
            \\]
            A function that takes a NewTesterDeviceEvent and returns None.
    """
    options = AppDistributionOptions(**kwargs)

    def on_new_tester_ios_device_published_inner_decorator(
            func: OnNewTesterIosDevicePublishedCallable):

        @_functools.wraps(func)
        def on_new_tester_ios_device_published_wrapped(raw: _ce.CloudEvent):
            from firebase_functions.private._alerts_fn import app_distribution_event_from_ce
            func(app_distribution_event_from_ce(raw))

        _util.set_func_endpoint_attr(
            on_new_tester_ios_device_published_wrapped,
            options._endpoint(
                func_name=func.__name__,
                alert_type='appDistribution.newTesterIosDevice',
            ),
        )
        return on_new_tester_ios_device_published_wrapped

    return on_new_tester_ios_device_published_inner_decorator


@_util.copy_func_kwargs(AppDistributionOptions)
def on_in_app_feedback_published(
    **kwargs
) -> _typing.Callable[[OnInAppFeedbackPublishedCallable],
                      OnInAppFeedbackPublishedCallable]:
    """
    Event handler which runs every time new feedback is received.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.app_distribution_fn as app_distribution_fn   

      @app_distribution_fn.on_in_app_feedback_published()
      def example(alert: app_distribution_fn.InAppFeedbackEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.AppDistributionOptions`
    :rtype: :exc:`typing.Callable`
            \\[ 
            \\[ :exc:`firebase_functions.alerts.app_distribution_fn.InAppFeedbackEvent` \\], 
            `None` 
            \\]
            A function that takes a NewTesterDeviceEvent and returns None.
    """
    options = AppDistributionOptions(**kwargs)

    def on_in_app_feedback_published_inner_decorator(
            func: OnInAppFeedbackPublishedCallable):

        @_functools.wraps(func)
        def on_in_app_feedback_published_wrapped(raw: _ce.CloudEvent):
            from firebase_functions.private._alerts_fn import app_distribution_event_from_ce
            func(app_distribution_event_from_ce(raw))

        _util.set_func_endpoint_attr(
            on_in_app_feedback_published_wrapped,
            options._endpoint(
                func_name=func.__name__,
                alert_type='appDistribution.inAppFeedback',
            ),
        )
        return on_in_app_feedback_published_wrapped

    return on_in_app_feedback_published_inner_decorator
