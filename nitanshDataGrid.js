var NitanshDataGrid = (function(){
    return function NitanshDataGrid(
    dataGridElement,
    data = [],
    pageSize,
    filter='',
    eventHandlers = {
      preRender: function () {},
      postRender: function () {}
    },
    tableConfig = {},
  ) {
     
    var start = 0;
    
    // toolbarElements
    var backButton = document.createElement('button');
    var forwardButton = document.createElement('button');
    var textSearch = document.createElement( 'input' );
    var toolbar = document.createElement( 'div' );
    
    backButton.innerText = "back";
    forwardButton.innerText = "forward";
    textSearch.type = "text";
    toolbar.className = 'toolbar';

    // utility functions
    this.forwardData = function( ){
        start = start+pageSize;
        if ( start >= filteredData.length ){
            start = start-pageSize;
            this.renderToolBar( pageSize, start, filteredData.length );
            return;    
        }
        dataGridElement.innerHTML = this.getTableHTML(
            filteredData,
            pageSize,
            start = start,
            filteredData.length
          );
        this.renderToolBar( pageSize, start, filteredData.length );
    }

    this.backwardData = function( ) {
        start = start-pageSize;
        if ( start < 0 ){
            start = 0;
            this.renderToolBar( pageSize, start, filteredData.length );
            return ;
        }
        dataGridElement.innerHTML = this.getTableHTML(
            filteredData,
            pageSize,
            start,
            filteredData.length
          );
        this.renderToolBar( pageSize, start, filteredData.length );
    }

    this.filterData = function (data, filter) {
        if ( !filter ) return data;
        return data.filter( ( singleRow ) => Object.values( singleRow )
            .some( 
                text  => text.toString().toLowerCase().includes(
                            filter.toLowerCase() 
                        )        
            )
        )
    };

    this.formatCellData = function formatCellData( columnRenderer, data ) {
        if ( !columnRenderer ){
            return data;
        }
        return columnRenderer( data );
    }
    
    var filteredData = this.filterData(data, filter);

    this.getColumnReordering = function( config ){
        return Object.keys( config ).sort(
            function( a, b ){ 
                return config[ a ][ 'order' ] - config[ b ][ 'order' ];
            }
        )
    }  

    // render table functions
    this.getHeaders =
      Object.keys( tableConfig ).length === 0
        ? Object.keys( data[0] )
        : this.getColumnReordering( tableConfig );
    
    this.getCustomHeader = function (data) {
        return tableConfig[ data ] && tableConfig[data][ 'headerName' ] || data;
        };
  
    this.getTableHeader = function (headers) {
      var headersHTML = "";
      headers.forEach((header) => {
        headersHTML = headersHTML + `<th>${this.getCustomHeader(header)}</th>`;
      });
      return `<thead><tr>${headersHTML}</tr></thead>`;
    };
  
    this.getRowData = function (rowData) {
        var rowBodyHTML = "";
        this.getColumnReordering( tableConfig ).forEach( ( column ) => {
          rowBodyHTML = rowBodyHTML + `<td>
            ${ this.formatCellData( 
                tableConfig[column] && tableConfig[column][ 'columnRenderer' ] ,
                rowData[column] 
                )}
            </td>`;
        });
        return rowBodyHTML;
    };

    this.sortData = function( data ){
        Object.keys( tableConfig ).forEach(
            key => {
                if ( tableConfig[ key ] && tableConfig[ key ][ 'sort' ] ){
                    if ( tableConfig[ key ][ 'sort' ] === 1 ){
                        data = data.sort( ( a, b ) => tableConfig[ key ][ 'sortFunction' ]( a[key], b[key] ) )
                    }else if ( tableConfig[ key ][ 'sort' ] === -1 ){
                        data = data.sort( ( a, b ) => tableConfig[ key ][ 'sortFunction' ](b[key], a[key] ) );
                    } 
                }
            }
        )
        return data;
    }

    this.getTableBody = function (data, pageSize, start = start, end) {
      pageSize = pageSize || data.length;
      end = end || data.length;
  
      var actualEnd = start + pageSize > end ? end : start + pageSize;
      var paginatedData = data.slice(start, actualEnd);
      var tableBodyHTML = "";
      var sortedData = this.sortData( paginatedData )
  
      sortedData.forEach((rowData) => {
        tableBodyHTML = tableBodyHTML + `<tr>${this.getRowData(rowData)}</tr>`;
      });

      return tableBodyHTML;
    };

  
    this.getTableHTML = function (data, pageSize, start, end) {
      return `    <table>
                  ${this.getTableHeader(this.getHeaders)}
                  ${this.getTableBody(data, pageSize, start, end)}
                  </table>
              `;
    };

    this.renderToolBar = function renderToolbar( pageSize, start, end ) {
        if ( start === 0 && pageSize + start > end ){
            forwardButton.style.display = 'none';
            backButton.style.display = 'none';
        }
        else if ( pageSize+start >= end ){
            forwardButton.style.display = 'none';
            backButton.style.display = 'block';
            // hide forward button
        } else if ( start == 0 ){
            // hide back button
            backButton.style.display = 'none';
            forwardButton.style.display = 'block';
        } else {
            // render both button
            backButton.style.display = 'block';
            forwardButton.style.display = 'block';
        }
    }

    this.render = function () {
        eventHandlers.preRender();
        dataGridElement.innerHTML = this.getTableHTML(
          filteredData,
          pageSize,
          start = 0,
          filteredData.length
        );
        toolbar.append( textSearch );
        toolbar.append( backButton );
        toolbar.append( forwardButton );
        dataGridElement.parentElement.append( toolbar );
        this.renderToolBar( pageSize, start, filteredData.length );
        eventHandlers.postRender();
    };

    this.filtertext = function(){
        var filter = textSearch.value;
        var filteredData = this.filterData(data, filter);
        dataGridElement.innerHTML = this.getTableHTML(
            filteredData,
            pageSize,
            start,
            filteredData.length
          );
        this.renderToolBar( pageSize, start, filteredData.length );
    }

    this.registerEventHandlers = function(){
        backButton.addEventListener("click", this.backwardData.bind( this) );
        forwardButton.addEventListener("click", this.forwardData.bind( this ) );
        textSearch.addEventListener("keyup", this.filtertext.bind( this ) );
    };

    this.registerEventHandlers();
  }
})();