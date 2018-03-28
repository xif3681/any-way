export default function FetchStrategyForDoc(Promise, $rootScope) {
  return {
    clientMethod: 'mget',

    /**
     * Flatten a series of requests into as ES request body
     * @param  {array} requests - an array of flattened requests
     * @return {Promise} - a promise that is fulfilled by the request body
     */
    reqsFetchParamsToBody: function (reqsFetchParams) {
      return Promise.resolve({
        docs: reqsFetchParams
      });
    },

    /**
     * Fetch the multiple responses from the ES Response
     * @param  {object} resp - The response sent from Elasticsearch
     * @return {array} - the list of responses
     */
    getResponses: function (resp) {
      $rootScope.timeMetricRatiosFlag = -1;
      //$rootScope.arMetricRatiosFlag----在dashboard界面的标记
      if ($rootScope.arDashboardFlag) {
        if (resp.docs[0]._source) {
          let visState = resp.docs[0]._source.visState;
          if (visState) {
            if (JSON.parse(visState).params.ratios) {
              $rootScope.arMetricRatiosArr.push({
                ratios: true
              });
            } else {
              $rootScope.arMetricRatiosArr.push({
                ratios: false
              });
            }
            if (JSON.parse(visState).type === 'gantt') {
              $rootScope.arGanttDArr.push({
                gantt: true,
                startTime: JSON.parse(visState).aggs[1].params.start_times,
                endTime: JSON.parse(visState).aggs[1].params.end_times
              });
            } else {
              $rootScope.arGanttDArr.push({
                gantt: false
              });
            }
          }
        }
      }
      // console.log($rootScope.arMetricRatiosArr)
      // console.log('---在dashboard数组界面的标记---')
      return resp.docs;
    }
  };
};
