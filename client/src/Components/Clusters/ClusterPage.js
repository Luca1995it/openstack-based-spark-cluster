{
    this.state.clusters.length > 0 ?
    <Table celled structured>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell rowSpan='2'>Name</Table.HeaderCell>
                <Table.HeaderCell colSpan={this.state.flavors.length}>Flavors</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>Actions</Table.HeaderCell>
            </Table.Row>
            <Table.Row>
                {this.state.flavors.map(flav => <Table.HeaderCell>{flav.name}</Table.HeaderCell>)}
            </Table.Row>
        </Table.Header>

        <Table.Body>
            {this.state.clusters.map(clus =>
                <Table.Row>
                    <Table.Cell>{clus.name}</Table.Cell>
                    {this.state.flavors.map(
                        flav => <Table.Cell>
                            {clus.flavors.find(fl => fl.id === flav.id) ? clus.flavors.find(fl => fl.id === flav.id).quantity : 0}
                        </Table.Cell>)
                    }
                    <Table.Cell>
                        <Button icon='delete' onClick={() => this.delete(clus.id)} circular />
                    </Table.Cell>
                </Table.Row>)}
        </Table.Body>
    </Table> : <Label>No clusters available, click add to create a new one</Label>
}