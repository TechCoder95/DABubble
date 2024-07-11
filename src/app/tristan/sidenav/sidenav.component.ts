import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

interface Node {
  name: string;
  children?: Node[];
}

interface FlattenedNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatTreeModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  private TREE_DATA: Node[] = [
    {
      name: 'Channels',
      children: [
        { name: '#Entwicklerteam' },
        { name: 'Channel hinzufügen' }
      ],
    },
    {
      name: 'Direktnachrichten',
      children: [
        { name: 'Felix Müller' },
        { name: 'Noah Ewen' },
      ],
    },
  ];

  private transformer = (node: Node, level: number): FlattenedNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level: level,
  });

  treeControl = new FlatTreeControl<FlattenedNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = this.TREE_DATA;
  }

  hasChild = (_: number, node: FlattenedNode) => node.expandable;

  isNewChannel(node: FlattenedNode): boolean {
    return node.name !== 'Channel hinzufügen' && node.name.startsWith('#');
  }

  addChannel() {
    const newChannel: Node = { name: '#Neuer Kanal' };
    const expandedNodes = new Set(this.treeControl.expansionModel.selected.map(node => node.name));
    const channelsNode = this.TREE_DATA.find(node => node.name === 'Channels');
    if (channelsNode && channelsNode.children) {
      const addChannelNodeIndex = channelsNode.children.findIndex(child => child.name === 'Channel hinzufügen');
      if (addChannelNodeIndex !== -1) {
        channelsNode.children.splice(addChannelNodeIndex, 0, newChannel);
        this.dataSource.data = [...this.TREE_DATA];
        this.treeControl.dataNodes.forEach(node => {
          if (expandedNodes.has(node.name)) {
            this.treeControl.expand(node);
          }
        });
      }
    }
  }

  handleNodeClick(node: FlattenedNode) {
    console.log('Node clicked:', node.name);
 
    if (node.expandable) {
      this.treeControl.toggle(node);
    }
    if (node.name === 'Channel hinzufügen') {
      this.addChannel();
    }
  }
}