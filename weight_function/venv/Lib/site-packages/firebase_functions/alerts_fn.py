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
Cloud functions to handle events from Firebase Alerts.
"""

import dataclasses as _dataclasses
import functools as _functools
import typing as _typing
import cloudevents.http as _ce
from firebase_functions.alerts import FirebaseAlertData

import firebase_functions.private.util as _util

from firebase_functions.core import T, CloudEvent as _CloudEvent
from firebase_functions.options import FirebaseAlertOptions

# Explicitly import AlertType to make it available in the public API.
# pylint: disable=unused-import
from firebase_functions.options import AlertType


@_dataclasses.dataclass(frozen=True)
class AlertEvent(_CloudEvent[T]):
    """
    A custom CloudEvent for Firebase Alerts (with custom extension attributes).
    """

    alert_type: str
    """
    The type of the alerts that got triggered.
    """

    app_id: str | None
    """
    The Firebase App ID that's associated with the alert. This is optional,
    and only present when the alert is targeting at a specific Firebase App.
    """


OnAlertPublishedEvent = AlertEvent[FirebaseAlertData[T]]
"""
The type of the event for 'on_alert_published' functions.
"""

OnAlertPublishedCallable = _typing.Callable[[OnAlertPublishedEvent], None]
"""
The type of the callable for 'on_alert_published' functions.
"""


@_util.copy_func_kwargs(FirebaseAlertOptions)
def on_alert_published(
    **kwargs
) -> _typing.Callable[[OnAlertPublishedCallable], OnAlertPublishedCallable]:
    """
    Event handler which triggers when a Firebase Alerts event is published.

    Example:

    .. code-block:: python

      from firebase_functions import alerts_fn   

      @alerts_fn.on_alert_published(
          alert_type=alerts_fn.AlertType.CRASHLYTICS_NEW_FATAL_ISSUE,
      )
      def example(alert: alerts_fn.AlertEvent[alerts_fn.FirebaseAlertData]) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.FirebaseAlertOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.alerts_fn.AlertEvent` \\[
            :exc:`firebase_functions.alerts_fn.FirebaseAlertData` \\[
            :exc:`typing.Any` \\] \\] \\], `None` \\]
            A function that takes a AlertEvent and returns None.
    """
    options = FirebaseAlertOptions(**kwargs)

    def on_alert_published_inner_decorator(func: OnAlertPublishedCallable):

        @_functools.wraps(func)
        def on_alert_published_wrapped(raw: _ce.CloudEvent):
            from firebase_functions.private._alerts_fn import alerts_event_from_ce
            func(alerts_event_from_ce(raw))

        _util.set_func_endpoint_attr(
            on_alert_published_wrapped,
            options._endpoint(func_name=func.__name__),
        )
        return on_alert_published_wrapped

    return on_alert_published_inner_decorator
