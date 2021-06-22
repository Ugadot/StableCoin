import os
import sys
import time

import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation


def read(logfile):
    with open(logfile) as f:
        data = {"ratio": {},
                "balances": {},
                "bonds": {}
                }
        while True:
            line = f.readline()
            # time.sleep(0.1)
            time.sleep(2)
            if line:
                if line.startswith('[Ratio]'):
                    split_line = line.split()
                    update_time = split_line[1]
                    value = split_line[2]
                    data["ratio"][update_time] = value
                elif line.startswith('[Balance]'):
                    split_line = line.split()
                    user_id = split_line[1]
                    value = split_line[2]
                    data["balances"][user_id] = value
                elif line.startswith('[Bond]'):
                    split_line = line.split()
                    user_id = split_line[1]
                    value = split_line[2]
                    data["bonds"][user_id] = value
                yield data


def print_online(log_file_path):
    fig, ax = plt.subplots(2, 1)
    ratio_plot, = ax[0].plot([])
    users = range(10)
    balances = [0] * 10
    balance_plot = ax[1].bar(users, balances, width=0.3, color="b")

    # twin object for two different y-axis on the sample plot
    ax_bond = ax[1].twinx()
    bond_users = [user+0.3 for user in users]
    # make a plot with different y-axis using second axis object
    bonds_plot = ax_bond.bar(bond_users, balances, width=0.3, color="r")
    ax_bond.set_ylabel("Bonds", color="r")
    ax_bond.set_ylim(0, 2)

    # ax[0].set_xlim(x[0], x[-1])
    ax[0].set_ylim(0, 2)

    ax[0].title.set_text('Ratio Vs Time')
    ax[0].set_ylabel(r'Ratio $\frac{base}{wanted}$')
    ax[0].set_xlabel('Time')

    ax[1].title.set_text("Users' Balances and Bonds")
    ax[1].set_ylabel('Balances')
    ax[1].set_xlabel('User')
    x_ticks = [user+0.15 for user in users]
    plt.sca(ax[1])
    plt.xticks(x_ticks, users)

    fig.suptitle("Live Updates", fontsize=18)

    def animate(data):
        x = [int(key) for key in data["ratio"].keys()]
        values = [float(ratio) for ratio in data["ratio"].values()]
        ratio_plot.set_data(x, values)
        ax[0].set_xlim(x[0], x[-1])
        # ax[0].set_ylim(min(values), max(values))

        # Balances
        users = [int(key) for key in data["balances"].keys()]
        values = [float(balance) for balance in data["balances"].values()]

        for i, b in enumerate(balance_plot):
            if i in users:
                b.set_height(values[users.index(i)])
        if values != []:
            ax[1].set_ylim(0, max(values) * 1.1)

        # Bonds
        users = [int(key) for key in data["bonds"].keys()]
        values = [float(bond) for bond in data["bonds"].values()]

        for i, b in enumerate(bonds_plot):
            if i in users:
                b.set_height(values[users.index(i)])
        if values != []:
            ax_bond.set_ylim(0, max(values) * 1.1)

        return ratio_plot,

    ani = FuncAnimation(fig, animate, frames=read(log_file_path), interval=10)
    plt.show()


if __name__ == "__main__":
    log_name = sys.argv[1]
    print_online(log_name)
