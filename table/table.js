angular.module('servoyextraTable',['servoy']).directive('servoyextraTable', ["$timeout","$sabloConstants","$foundsetTypeConstants", function($timeout, $sabloConstants, $foundsetTypeConstants) {  
    return {
      restrict: 'E',
      scope: {
       	model: "=svyModel",
       	svyServoyapi: "=",
		api: "=svyApi",
       	handlers: "=svyHandlers"
      },
      link: function($scope, $element, $attrs) {

    	  function getNumberFromPxString(s) {
    		  var numberFromPxString = -1;
			  if(s) {
				  s = s.trim().toLowerCase();
				  if(s.indexOf("px") == s.length - 2) {
					  s = s.substring(0, s.length - 2);
				  }
				  if($.isNumeric(s)) {
					  numberFromPxString = parseInt(s);
				  }
			  }
			  return numberFromPxString;
    	  }    	  
    	  
    	  function calculateTableWidth() {
    		  var tableWidth = 0;
    		  if($scope.model.columns) {
	    		  for(var i = 0; i < $scope.model.columns.length; i++) {
	    			  if(!$scope.model.columns[i].autoResize && getNumberFromPxString($scope.model.columns[i].initialWidth) > 0) {
		    			  var w = getNumberFromPxString($scope.model.columns[i].width);
		    			  if(w > -1) {
		    				  tableWidth += w;
		    			  }
	    			  }
	    		  }
    		  }
    		  return tableWidth;
    	  }    	  
    	  
    	  function getAutoColumns() {
    		  var autoColumns = {columns: {}, minWidth: {}, count : 0};
    		  if($scope.model.columns) {
	    		  for(var i = 0; i < $scope.model.columns.length; i++) {
	    			  if($scope.model.columns[i].initialWidth == undefined) {
	    				  $scope.model.columns[i].initialWidth = $scope.model.columns[i].width == undefined ? "" : $scope.model.columns[i].width; 
	    			  }
	    			  else {
	    				  $scope.model.columns[i].width = $scope.model.columns[i].initialWidth; 
	    			  }
	    			  var minWidth = getNumberFromPxString($scope.model.columns[i].width);
	    			  if($scope.model.columns[i].autoResize || minWidth < 0) {
	    				  autoColumns.columns[i] = true;
	    				  autoColumns.minWidth[i] = minWidth;
	    				  autoColumns.count += 1;
	    			  }
	    		  }
    		  }

    		  return autoColumns;
    	  }

    	  function updateAutoColumnsWidth(delta) {
    		  var componentWidth = getComponentWidth();
    		  var oldWidth = componentWidth - delta;  
			  for(var i = 0; i < $scope.model.columns.length; i++) {
				  if(autoColumns.columns[i]) {
					  if(autoColumns.minWidth[i] > 0) {
						  var w = Math.floor(getNumberFromPxString($scope.model.columns[i].width) * componentWidth / oldWidth);
						  if(w < autoColumns.minWidth[i]) {
							  w = autoColumns.minWidth[i];
						  }
						  $scope.model.columns[i].width = w + "px";
					  }
					  else {
						  $scope.model.columns[i].width = $scope.model.columns[i].initialWidth;
					  }
				  }
			  }    		  
    	  }    	  
    	  
    	  
    	  $scope.componentWidth = 0;
    	  function getComponentWidth() {
    		  if(!$scope.componentWidth) {
    			  $scope.componentWidth = $element.parent().outerWidth(false);
    		  }
    		  return $scope.componentWidth;
    	  }
    	  
    	  var autoColumns = getAutoColumns();
    	  var tableWidth = calculateTableWidth();
    	  
    	  var tableLeftOffset = 0;
    	  var onTBodyScrollListener = null;
    	  var resizeTimeout = null;
    	  
    	  function onColumnResize() {

			  var table = $element.find("table:first");
			  var headers = table.find("th");
    	      
			  for(var i = 0; i < headers.length; i++) {
				  var header = $(headers.get(i));
				  if((autoColumns.minWidth[i] > 0) && (getNumberFromPxString(header[0].style.width) < autoColumns.minWidth[i])) {
					  $scope.model.columns[i].width = autoColumns.minWidth[i] + "px";
	        		  updateAutoColumnsWidth(0);
	        		  $timeout(function() {
	        			  addColResizable(true);
	        		  }, 0);
	        		  return;
				  }
				  $scope.model.columns[i].width = header[0].style.maxWidth = header[0].style.minWidth = header[0].style.width;
			  }
			  
			  var resizer = $element.find(".JCLRgrips");
			  var resizerLeft = getNumberFromPxString($(resizer).css("left"));

			  var colGrips = $element.find(".JCLRgrip");
			  var leftOffset = 1;
			  for(var i = 0; i < colGrips.length; i++) {
				  leftOffset += getNumberFromPxString($scope.model.columns[i].width);
				  $(colGrips.get(i)).css("left", leftOffset - resizerLeft + "px");
			  }
    	  }
    	  
    	  $(window).on('resize', function() {
    		  if(resizeTimeout) $timeout.cancel(resizeTimeout);
    		  if($scope.model.columns) {
	    		  resizeTimeout = $timeout(function() {
					  $scope.$apply(function(){
						  var newComponentWidth = $element.parent().outerWidth(false);
						  var deltaWidth = newComponentWidth - getComponentWidth();
						  if(deltaWidth != 0) {
			        		  $scope.componentWidth = newComponentWidth;
			        		  updateAutoColumnsWidth(deltaWidth);
			        		  if($scope.model.enableColumnResize) {
		    			  		$timeout(function() {
		    			  			addColResizable(true);
		    			  		}, 0);
			        		  }
						  }
					  })   
	    		  }, 50);
    		  }
    	  });

    	  function addColResizable(cleanPrevious) {
    		  var tbl = $element.find("table:first");
    		  if(cleanPrevious) {
        		  tbl.colResizable({
        			  disable:true,
        			  removePadding:false
        		  });  
    		  }
    		  tbl.colResizable({
    			  liveDrag:false,
    			  resizeMode:"fit",
    			  onResize:function(e) {
    				  $scope.$apply(function(){    	                	
    					  onColumnResize();
    				  })
    			  },
    			  removePadding:false
    		  	});
    		  // don't want JColResize to change the column width on window resize
    		  $(window).unbind('resize.JColResizer');
    		  // update the model with the right px values
    		  var tbl = $element.find("table:first");
			  var headers = tbl.find("th");
			  if($(headers).is(":visible")) {
	    		  for(var i = 0; i < $scope.model.columns.length; i++) {
	    			  if(autoColumns.columns[i] && autoColumns.minWidth[i] < 0) {
	    				  $scope.model.columns[i].width = $(headers.get(i)).outerWidth(false) + "px";
	    			  }
	    		  }				  
			  }
    	  }

    	  
    	  $scope.$on('ngRowsRenderRepeatFinished', function(ngRepeatFinishedEvent) {
    		  if(!onTBodyScrollListener) {
    			  var tbl = $element.find("table:first");
    			  var tblBody = tbl.find("tbody");
    			  onTBodyScrollListener = function() {
    				  $timeout(function(){
    					  tableLeftOffset = -$(tblBody).scrollLeft();
        				  var resizer = $element.find(".JCLRgrips");
        				  if(resizer.get().length > 0) {
        					  $(resizer).css("left", tableLeftOffset + "px");
        				  }
    				  });
    			  }    			  
    			  $(tblBody).bind("scroll", onTBodyScrollListener);
    		  }
    		  if($scope.model.enableColumnResize) {
    			  autoColumns = getAutoColumns();
    			  tableWidth = calculateTableWidth();
    			  updateAutoColumnsWidth(0);    			  
	    		  addColResizable(true);
	        	  Object.defineProperty($scope.model, $sabloConstants.modelChangeNotifier, {
	        		  configurable : true,
	        		  value : function(property, value) {
	        			  switch (property) {
	        			  	case "columns":
	        			  		var valueChanged = false;
	        			  		for(var i = 0; i < $scope.model.columns.length; i++) {
	        			  			var iw = getNumberFromPxString($scope.model.columns[i].initialWidth);
	        			  			if(iw > -1 && ($scope.model.columns[i].width != $scope.model.columns[i].initialWidth)) {
	        			  				$scope.model.columns[i].initialWidth = $scope.model.columns[i].width;
	        			  				if(!valueChanged) valueChanged = true;	        			  				
	        			  			}
	        			  		}    
	        			  		
	        			  		if(valueChanged) {
	        			  			autoColumns = getAutoColumns();
		        			  		tableWidth = calculateTableWidth();
		        			  		updateAutoColumnsWidth(0);
		        			  		$timeout(function() {
		        			  			addColResizable(true);
		        			  		}, 0);
	        			  		}
	        			  		break;
	        			  }
	        		  }
	        	  });
    		  }
    	  });
    	  
    	  var unregTbody = $scope.$watch(function() {
    		  return $element.find("tbody").length;
    	  },function(newValue) {
    		  if (newValue == 0) return;
    		  unregTbody();
    		  if ($scope.model.pageSize == 0) {
        		  // this is endless scrolling
        		  var tbody = $element.find("tbody");
        		  var lastRequestedViewPortSize = 0;
        		  tbody.scroll(function (e) {
        			  var viewportSize = $scope.model.foundset.viewPort.size;
        			  if (viewportSize != lastRequestedViewPortSize && $scope.model.foundset.serverSize > viewportSize && 
        			     (tbody.scrollTop() + tbody.height()) > (tbody[0].scrollHeight - tbody.height()))
        			  { 
        				lastRequestedViewPortSize = viewportSize;
        				$scope.model.foundset.loadExtraRecordsAsync(nonePagingPageSize);
        			  }
        		  })
        	  }
    	  })
    	  var nonePagingPageSize = 200;
    	  $scope.$watch('model.foundset.serverSize', function (newValue) {
    		  if (newValue)
    		  {
    			  if (!$scope.showPagination())
    			  {
    				  var rowsToLoad = Math.min(newValue,$scope.model.pageSize?$scope.model.pageSize:nonePagingPageSize)
    				  if ($scope.model.foundset.viewPort.size <  rowsToLoad)
    					  $scope.model.foundset.loadExtraRecordsAsync(rowsToLoad - $scope.model.foundset.viewPort.size);
    			  }
    			  else
    			  {
    				  if ($scope.model.pageSize * ($scope.model.currentPage -1) > newValue)
    				  {
    					  $scope.model.currentPage =  Math.floor(newValue / $scope.model.pageSize) + 1;
    				  }
    				  else
    				  {
    					  $scope.model.foundset.loadRecordsAsync($scope.model.pageSize * ($scope.model.currentPage -1), $scope.model.pageSize);
    				  }
    			  }	  
    		  }	  
          });
    	  
    	  $scope.$watch('model.currentPage', function (newValue) {
    		  if (newValue &&  $scope.showPagination())
    		  {
    			  $scope.model.foundset.loadRecordsAsync($scope.model.pageSize * (newValue -1), $scope.model.pageSize);
    		  }	  
          });
    	  
    	  $scope.$watch('model.pageSize', function (newValue,oldValue) {
    		  if (oldValue && newValue &&  $scope.showPagination())
    		  {
    			  $scope.model.foundset.loadRecordsAsync($scope.model.pageSize * ($scope.model.currentPage -1), $scope.model.pageSize);
    		  }	  
    		  $scope.model.foundset.setPreferredViewportSize(newValue)
          });
    	  
    	  $scope.$watch('model.foundset.viewPort', function (newValue,oldValue) {
			 if ($scope.showPagination()) {
				 if ($scope.model.pageSize * ($scope.model.currentPage -1) != newValue.startIndex) {
					 $scope.model.currentPage =  Math.floor(newValue.startIndex / $scope.model.pageSize) + 1;
				 }
				 else if (newValue.size < $scope.model.pageSize && $scope.model.foundset.serverSize > (newValue.startIndex+newValue.size)) {
					 $scope.model.foundset.loadRecordsAsync($scope.model.pageSize * ($scope.model.currentPage -1), $scope.model.pageSize);
				 }
			 }
          });
    	  var toBottom = false;
    	  var tbody = null;
    	  var wrapper = null;
    	  $scope.$watch('model.visible', function(newValue) {
    		  if (!newValue) {
    			   toBottom = false;
    			   tbody = null;
    			   wrapper = null;
    		  }
    	  })
    	  function scrollIntoView() {
    		  var firstSelected = $scope.model.foundset.selectedRowIndexes[0];
    		  firstSelected = firstSelected - ($scope.model.pageSize * ($scope.model.currentPage -1));
    		  var child = tbody.children().eq(firstSelected)
			  if (child.length > 0) {
				  var wrapperRect = wrapper.getBoundingClientRect();
				  var childRect =child[0].getBoundingClientRect();
				  if (childRect.top < (wrapperRect.top+10) || childRect.bottom > wrapperRect.bottom) {
					  child[0].scrollIntoView(!toBottom);
				  }
			  }
    	  }
    	  $scope.$watch('model.foundset.selectedRowIndexes', function (newValue,oldValue) {
    		  if ( $scope.model.foundset && $scope.model.foundset.selectedRowIndexes.length > 0) {
    			  if (tbody == null || tbody.length == 0) {
    				  wrapper = $element.find(".tablewrapper")[0];
    				  tbody= $element.find("tbody");
    			  }
    			  if(tbody.children().length > 1) {
    				  scrollIntoView();
    			  }
    			  else {
    				  $timeout(scrollIntoView, 200)
    			  }
    			 
    		  }
    	  },true)
    	  
    	  $scope.getUrl = function(column,row) {
    		 if (column && row)
    		 {
    			 var index = $scope.model.foundset.viewPort.rows.indexOf(row)
    			if (index >= 0 && column.dataprovider && column.dataprovider[index] && column.dataprovider[index].url)
    			{
    				 return column.dataprovider[index].url;
    			}	 
    		 }	  
       		 return null; 
       	  }
    	  
    	  $scope.hasNext = function() {
      		 return $scope.model.foundset && $scope.model.currentPage < Math.ceil($scope.model.foundset.serverSize / $scope.model.pageSize); 
      	  }
    	  
    	  $scope.showPagination = function() {
     		 return $scope.model.pageSize && $scope.model.foundset && $scope.model.foundset.serverSize > $scope.model.pageSize; 
     	  }
    	  
    	  $scope.modifyPage = function(count) {
    		var pages = Math.ceil($scope.model.foundset.serverSize / $scope.model.pageSize)
    		var newPage = $scope.model.currentPage + count;
    		if (newPage >= 1 && newPage <= pages)
    		{
    			$scope.model.currentPage = newPage;
    		}	
    	  }
    	  
    	  $scope.getRealRow = function(row) {
    		  var realRow = row;
    		  if ($scope.showPagination())
    		  {
    			  realRow = realRow + $scope.model.pageSize * ($scope.model.currentPage -1);
    		  }	
    		  return realRow;
    	  }
    	  
    	  $scope.tableClicked = function(event, type) {
    		 var elements = document.querySelectorAll(':hover');
    		 for(var i=elements.length;--i>0;) {
    			 var row_column = $(elements[i]).data("row_column");
    			 if (row_column) {
    				 var rowIndex = $scope.model.foundset.viewPort.rows.indexOf(row_column.row); 
    				 var columnIndex = $scope.model.columns.indexOf(row_column.column);
    				 var realRow = $scope.getRealRow(rowIndex);
    				 var newSelection = [realRow];
//    				 if($scope.model.foundset.multiSelect) {
	    				 if(event.ctrlKey) {
	    					 newSelection = $scope.model.foundset.selectedRowIndexes ? $scope.model.foundset.selectedRowIndexes.slice() : [];
	    					 var realRowIdx = newSelection.indexOf(realRow);
	    					 if(realRowIdx == -1) {
	    						 newSelection.push(realRow);
	    					 }
	    					 else if(newSelection.length > 1) {
	    						 newSelection.splice(realRowIdx, 1);
	    					 }
	    				 }
	    				 else if(event.shiftKey) {
	    					 var start = -1;
	    					 if($scope.model.foundset.selectedRowIndexes) {
	    						 for(var i = 0; i < $scope.model.foundset.selectedRowIndexes.length; i++) {
	    							 if(start == -1 || start > $scope.model.foundset.selectedRowIndexes[i]) {
	    								 start = $scope.model.foundset.selectedRowIndexes[i];
	    							 }
	    						 }
	    					 }
	    					 var stop = realRow;
	    					 if(start > realRow) {
	    						 stop = start;
	    						 start = realRow;
	    					 }
	    					 newSelection = []
	    					 for(var i = start; i <= stop; i++) {
	    						 newSelection.push(i);
	    					 }
	    				 }
//    				 }

    				 $scope.model.foundset.requestSelectionUpdate(newSelection);
    				 if (type == 1 && $scope.handlers.onCellClick) {
    					$scope.handlers.onCellClick(realRow + 1, columnIndex, $scope.model.foundset.viewPort.rows[rowIndex]);
    		    	 }
    		    	  
    		    	 if ( type == 2 && $scope.handlers.onCellRightClick) {
    					$scope.handlers.onCellRightClick(realRow + 1, columnIndex, $scope.model.foundset.viewPort.rows[rowIndex]);
    		    	 }
    			 }
    		 }
    	  }
    	  if ($scope.handlers.onCellRightClick) {
    		  $scope.tableRightClick = function(event) {
    			  $scope.tableClicked(event,2);
    		  }
    	  }
    	  
    	  if ($scope.model.enableSort || $scope.handlers.onHeaderClick) {
    		  $scope.headerClicked = function(column) {
    			  if($scope.model.enableSort && $scope.model.columns[column].dataprovider) {
					  var sortCol = $scope.model.columns[column].dataprovider.idForFoundset;
					  var sortDirection = "asc";
    				  if($scope.model.foundset.sortColumns) {
    					  var sortColumnsA = $scope.model.foundset.sortColumns.split(" ");
    					  if(sortCol == sortColumnsA[0] ) {
    						  sortDirection = sortColumnsA[1].toLowerCase() == "asc" ? "desc" : "asc";
    					  }
    				  }
    				  $scope.model.foundset.sortColumns = sortCol + " " + sortDirection;
					  $scope.model.foundset.sort([{name: sortCol, direction: sortDirection}]);
    			  }
    			  if($scope.handlers.onHeaderClick) {
    				  $scope.handlers.onHeaderClick(column);
    			  }
    		  }
    	  }
    	  

    	  $scope.getRowStyle = function(row) {
    		  var isSelected = $scope.model.foundset.selectedRowIndexes && $scope.model.foundset.selectedRowIndexes.indexOf($scope.getRealRow(row)) != -1; 
    		  return  isSelected ? $scope.model.selectionClass : " ";
    	  }
    	  
    	  $scope.keyPressed = function(event) {
    		  var fs = $scope.model.foundset;
    		  if (fs.selectedRowIndexes && fs.selectedRowIndexes.length > 0) {
    			  var selection = fs.selectedRowIndexes[0];
				  if (event.keyCode == 34 || event.keyCode == 33) {
					  var firstSelected = $scope.model.foundset.selectedRowIndexes[0];
		    		  firstSelected = firstSelected - ($scope.model.pageSize * ($scope.model.currentPage -1));
		    		  var child = tbody.children().eq(firstSelected)
		    		  if (child.length > 0) {
			    		 var childBounds =  child[0].getBoundingClientRect();
			    		 var tbodyBounds = tbody[0].getBoundingClientRect();
			    		 if (event.keyCode == 34) {
				    		 if (childBounds.top <= (tbodyBounds.top + childBounds.height - 5)) {
				    		  var newTopChild = null;
				    		  var totalHeight = childBounds.height/2;
				    		  var numberOfItems = 0;
				    		  var children = tbody.children().slice(firstSelected);
				    		  for(;numberOfItems<children.length;numberOfItems++) {
				    		  	var childHeight = children[numberOfItems].getBoundingClientRect().height;
				    		  	totalHeight += childHeight;
				    		  	if ( totalHeight > tbodyBounds.height) {
				    		  		newTopChild = children[numberOfItems];
				    		  		break;
				    		  	}
				    		  }
				    		  if (newTopChild != null) {
				    		  	 newTopChild.scrollIntoView(true);
				    		  	 fs.selectedRowIndexes = [firstSelected+numberOfItems];
				    		  }
				    		 }
				    		 else {
				    		 	 child[0].scrollIntoView(true);
				    		 }
			    		 }
			    		 else if (childBounds.bottom <= (tbodyBounds.bottom - childBounds.height + 5)) {
							 child[0].scrollIntoView(false);
			    		 }
						 else {
				    		  var newTopChild = null;
				    		  var totalHeight = childBounds.height/2;
				    		  var numberOfItems = firstSelected;
				    		  var children = tbody.children();
				    		  for(;numberOfItems>0;numberOfItems--) {
				    		  	var childHeight = children[numberOfItems].getBoundingClientRect().height;
				    		  	totalHeight += childHeight;
				    		  	if ( totalHeight > tbodyBounds.height) {
				    		  		newTopChild = children[numberOfItems];
				    		  		break;
				    		  	}
				    		  }
				    		  if (newTopChild != null) {
				    		  	 newTopChild.scrollIntoView(false);
				    		  	 fs.selectedRowIndexes = [numberOfItems];
				    		  }
			    		 }
	    			  }
				  }
				  else if (event.keyCode == 38) {
	    			  if (selection > 0) {
	    				  fs.selectedRowIndexes = [selection-1];
	    				  if ( (fs.viewPort.startIndex) <=  selection-1){
	    					  toBottom = false;
	    				  }
	    				  else $scope.modifyPage(-1);
	    			  }
	    			  event.preventDefault();
	    		  }
	    		  else if (event.keyCode == 40) {
	    			  if (selection < fs.serverSize-1) {
	    				  fs.selectedRowIndexes = [selection+1];
	    				  if ( (fs.viewPort.startIndex + fs.viewPort.size) >  selection+1){
	    					  toBottom = true;
	    				  }
	    				  else $scope.modifyPage(1);
	    			  }
	    			  event.preventDefault();
	    		  } 
	    		  else if (event.keyCode == 13) {
	    			 if ($scope.handlers.onCellClick) {
	    				 $scope.handlers.onCellClick(selection+1, null,fs.viewPort.rows[selection])
	    			 }
	    		  }
    		  }
    	  }
    	  
    	  $scope.getTableStyle = function () {
    		  var tableStyle = {};
    	      tableStyle.width = autoColumns.count > 0 ? getComponentWidth() + "px" : tableWidth + "px";
    		  return tableStyle;
    	  }
  
    	  
    	  $scope.getTHeadStyle = function() {
    		  var tHeadStyle = {};
    		  if($scope.model.enableSort || $scope.handlers.onHeaderClick) {
    			  tHeadStyle.cursor = "pointer";
    		  }
   			  tHeadStyle.width = autoColumns.count > 0 ? getComponentWidth() + "px" : tableWidth + "px";
    		  tHeadStyle.left = tableLeftOffset + "px";
    		  return tHeadStyle;
    	  }
    	  
    	  $scope.getTBodyStyle = function() {
    		  var tBodyStyle = {};
    		  var componentWidth = getComponentWidth();
    		  tBodyStyle.width = componentWidth + "px";
    		  if(tableWidth < componentWidth) {
    			  tBodyStyle.overflowX = "hidden";
    		  }
    		  var tbl = $element.find("table:first");
			  var tblHead = tbl.find("thead");
			  if($(tblHead).is(":visible")) {
				  tBodyStyle.top = $(tblHead).height() + "px";
			  }
    		  if($scope.showPagination()) {
    			  var pagination = $element.find("ul:first");
    			  if(pagination.get().length > 0) {
    				  tBodyStyle.marginBottom = ($(pagination).height() + 2) + "px";
    			  }
    		  }			  
			  return tBodyStyle;
    	  }

    	  $scope.getColumnStyle = function (column) {
        	  var columnStyle = {overflow: "hidden"};
			  var w = getNumberFromPxString($scope.model.columns[column].width);
			  if(w > -1) {
				  columnStyle.minWidth = columnStyle.maxWidth = columnStyle.width = w + "px";
			  }
			  else if($scope.model.columns[column].width) {
				  columnStyle.width = $scope.model.columns[column].width;
			  }
			  else {
				  columnStyle.minWidth = columnStyle.maxWidth = columnStyle.width = Math.floor((getComponentWidth() - tableWidth) / autoColumns.count) + "px";
			  }
        	  return columnStyle;
    	  }

    	  $scope.getCellStyle = function (row, column) {
        	  var cellStyle = {overflow: "hidden"};
        	  if(/*row == 0 && */column < $scope.model.columns.length) {
        		  var w = getNumberFromPxString($scope.model.columns[column].width);
        		  if ($scope.model.columns[column].autoResize || w < 0) {
            		  var tbl = $element.find("table:first");
    				  var headers = tbl.find("th");
    				  if($(headers).is(":visible")) {
    					  w = $(headers.get(column)).outerWidth(false);
    				  }
        		  }
        		  if(w > -1) {
        			  cellStyle.minWidth = w + "px";
        			  cellStyle.width = w + "px";
        			  cellStyle.maxWidth = w + "px";
        		  }
        		  else if ($scope.model.columns[column].width) {
        			  cellStyle.width = $scope.model.columns[column].width;
        		  }
        	  }
        	  return cellStyle;
    	  }
    	  
    	  $scope.getSortClass = function (column) {
    		  var sortClass = "table-servoyextra-sort-hide";
    		  if($scope.model.enableSort && $scope.model.foundset && $scope.model.foundset.sortColumns && $scope.model.columns[column].dataprovider) {
    			  var sortCol = $scope.model.columns[column].dataprovider.idForFoundset;
    			  var sortColumnsA = $scope.model.foundset.sortColumns.split(" ");
    			  if(sortCol == sortColumnsA[0]) {
    				  var direction = sortColumnsA[1].toLowerCase() == "asc" ? "up" : "down";
    				  sortClass = "table-servoyextra-sort-show-" + direction + " " + $scope.model["sort"+direction+"Class"];
    			  }
    		  }
    		  return sortClass;
    	  }
    	  
    	  $scope.getLayoutStyle = function() {
    		  var layoutStyle = {};
    		  var isAbsolute = $scope.$parent.formProperties && $scope.$parent.formProperties.absoluteLayout;
    		  if(isAbsolute) {
    			  layoutStyle.position = "absolute";
    			  layoutStyle.height = "100%";
    		  }
    		  else {
    			  layoutStyle.position = "relative";
    			  if($scope.model.columns) {
    				  layoutStyle.height = $scope.model.responsiveHeight + "px";
    			  }
    		  }
    		  return layoutStyle;
    	  }
    	  
    	  $scope.showEditorHint = function()
    	  {
    		  return (!$scope.model.columns || $scope.model.columns.length == 0) && $scope.svyServoyapi.isInDesigner();
    	  }
    	  
    	  var skipOnce = false;
    	  if ( $scope.handlers.onFocusGainedMethodID) {
    		  $scope.onFocusGained = function(event) {
    			  if (!skipOnce) {
    				  $scope.handlers.onFocusGainedMethodID(event);
    			  }
    			  skipOnce = false;
    		  }
    	  }
    	  
    	//implement api calls starts from here
			/**
			 * Request the focus to the table html element.
			 * @example %%prefix%%%%elementName%%.requestFocus();
			 * @param mustExecuteOnFocusGainedMethod (optional) if false will not execute the onFocusGained method; the default value is true
			 */
			$scope.api.requestFocus = function(mustExecuteOnFocusGainedMethod) {
				var tbl = $element.find("table:first");
				skipOnce = mustExecuteOnFocusGainedMethod === false;
				tbl.focus();
			}
      },
      templateUrl: 'servoyextra/table/table.html'
    };
  }])
  .filter('getDisplayValue', function () { // filter that takes the realValue as an input and returns the displayValue
	return function (input, valuelist) {
		if (valuelist) {
			for (i = 0; i < valuelist.length; i++) {
				if (input === valuelist[i].realValue) {
					return valuelist[i].displayValue;
				}
			}
		}
		return input;
	};
}).directive('modelInData', function($parse) {
	   return {
		     restrict: 'A',
		     link: function($scope, $element, $attrs) {
		       var model = $parse($attrs.modelInData)($scope);
		       $element.data('row_column', model);
		     }
		   }
}).directive('onFinishRenderRows', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRenderRows);
                });
            }
        }
    }
});

  
  
