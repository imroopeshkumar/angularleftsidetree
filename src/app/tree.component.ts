import { Component, HostListener, OnDestroy, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { BlobUrl } from './svgPath';
import * as D3 from 'd3';
@Component({
  selector: 'tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TreeComponent {
  @Input() data;
  @Input() index;

  @ViewChild('treeElement') treeElement;

  intializeTree(index) {
    if (this.index == index) {
      this.createOrUpdate(this.data)
    }
  }

  ngAfterViewInit() {
    this.createOrUpdate(this.data)
  }

  createOrUpdate(message) {
    this.treeJsonData = message;
    if (this.isTree) {

      D3.select(this.treeElement.nativeElement).selectAll("svg").remove();
      this.svg = undefined;
    }
    this.isTree = true;
    this.getTree(this.treeJsonData);
    this.globalheight = Math.round(this.barCount * this.barHeight);
  }


  isTree = false;
  treeJsonData: JSON;
  currentWidth: number;
  currentHeight: number;
  margin = { top: 25, right: 20, bottom: 30, left: 0 };
  width = this.currentWidth = 350;
  height = this.currentHeight = 2500;
  barCount: number = 3;
  barHeight: number = 0;
  barWidth: number = 0;
  globalheight: number = 0;
  i = 0;
  duration = 400;
  root;
  tree;
  svg;
  delete = false;
  key: string = "IdeaJson";

    getIcon(entityType)
    {
      let icon;
      switch(entityType)
      {
        case "IdeasCategorhy": icon = BlobUrl +"." + entityType;
                              
      }

      console.log(icon);
    }
  getTree(jsonData) {
    try {
      var self = this;
      var treeData = jsonData;
      if (self.svg) {

      } else {
        var nativeElement = this.treeElement.nativeElement
        self.svg = D3.select(nativeElement)
          .classed("svg-container", true) //container class to make it responsive
          .append("svg")
          .attr('width', this.currentWidth)
          .attr('height', this.currentHeight - 5)

          .classed("svg-content-responsive", true)
          .append("g")
          .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
      }

      this.root = D3.hierarchy(treeData, function (d) {
        return d.Children;
      });

      this.tree = D3.tree().nodeSize([0, 25]) //Invokes tree
      this.update(this.root);

    } catch (e) {
      console.error('Exception in  getTree() Method in TreeBody Component, Exception is : ' + e);
    }
  }

  collapse = (d) => {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(this.collapse);
      d.children = null;
    }
  };
  lastClickD = null;

  // Toggle children on click.
  click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    if (this.lastClickD) {
      this.lastClickD._isSelected = false;
    }
    d._isSelected = true;
    this.lastClickD = d;

    this.update(d);
  }

  update(source) {
    try {
      var self = this;
      this.barHeight = Math.round(this.currentWidth / 12);
      // NODE SIZE
      this.barWidth = Math.round(this.currentWidth / 1.75) * 1.2;
      if (this.delete) {
        var nodes = this.tree(source);
      }
      else {
        var nodes = this.tree(this.root); //returns a single node with the properties of d3.tree()
      }
      var nodesSort = [];

      D3.select("svg").transition()
        .duration(this.duration); //transition to make svg looks smoother
      nodes.eachBefore((n) => {
        nodesSort.push(n);
      });

      this.barCount = 4;
      // Compute the "layout".
      nodesSort.forEach((n, i) => {
        n.x = i * (this.barHeight);
        this.barCount++;
      })
      let nodeEnter;
      // Update the nodes…
      var node = this.svg.selectAll("g.node")
        .data(nodesSort, (d) => { return d.id || (d.id = ++this.i); })

      nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", (d) => { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 1e-6);

      nodeEnter.append("rect")
        .attr("y", -this.barHeight / 2)
        .attr("height", this.barHeight)
        .attr("width", this.barWidth)
        .style("fill", this.color)
        .attr('stroke', '#ffffff')
        .attr('fill-opacity', '0.5')
        .attr('stroke-width', '0.6')
        .on("click", (d) => {
          this.click(d);
          // this.GetDetails(d)
        });

      nodeEnter.append("text")
        .attr("dy", 3.5)
        .attr("dx", 45)
        .text((d) => {
          return d.data.Name;
        })
        .attr("font-size", Math.round(this.currentWidth / 22))
        .attr("fill", "white")
        .on("click", (d) => {
          this.click(d);
          // this.GetDetails(d)
        });

      nodeEnter.append("image")
        .attr("xlink:href", (d) => {

           this.getIcon(d.data.EntityType);
          return d.data.Icon;
        })
        .attr("x", 0)
        .attr("y", -12)
        .attr("width", 45)
        .attr("height", 25)


      // Transition nodes to their new position.
      nodeEnter.transition()
        .duration(this.duration)
        .attr("transform", (d) => { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1);

      node.transition()
        .duration(this.duration)
        .attr("transform", (d) => { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1)
        .select("rect")
        .style("fill", this.color);

      // Transition exiting nodes to the parent's new position.
      node.exit().transition()
        .duration(this.duration)
        .attr("transform", (d) => { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 1e-6)
        .remove();

      nodes.eachBefore((d) => {
        d.x0 = d.x;
        d.y0 = d.y
      });


      // update link
      var link = this.svg.selectAll('path.link')
        .data(nodesSort, function (d) { return d.id; });

      // Enter any new links at the parent's previous position.
      var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', (d) => {
          var o = { x: source.x0, y: source.y0 }
          return this.diagonal(o, o)
        })
        .attr("fill", "none")
        .attr("stroke", "#add1e9");

      var nodedata = D3.selectAll('g.node');
      var linkdata = D3.selectAll('path.link')
      // remove node
      nodedata.each(function (d) {
        if (d.data.Name == "root") {
          D3.select(this).remove();
        }
      });
      linkdata.each(function (d) {

        if (d.data.parent && d.data.parent.id == "root") {
          D3.select(this).remove();
        }

      });
      // UPDATE
      var linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition()
        .duration(this.duration)
        .attr('d', (d) => { return this.diagonal(d, d.parent != null ? d.parent : d) });

      // Remove any exiting links
      var linkExit = link.exit().transition()
        .duration(this.duration)
        .attr('d', (d) => {
          var o = { x: source.x, y: source.y }
          return this.diagonal(o, o)
        })
        .remove();

      nodesSort.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    } catch (e) {
      console.error('Exception in  Update() Method in TreeBody Component, Exception is : ' + e);
    }
  }

  diagonal(s, d) {
    try {
      var path = `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`

      return path
    } catch (e) {
      console.error('Exception in  diagonal() Method in TreeBody Component, Exception is : ' + e);
    }
  }

  color(d) {
    let color = "#3182bd"
    if (d.data.Type == 0) {
      color = "transparent"
    } else if (d.data.Type == 1) {
      color = "transparent"
    } else if (d.data.Type == 2) {
      color = "transparent"
    } else if (d.data.Type == 3) {
      color = "transparent"
    }
    return color;
  }

}