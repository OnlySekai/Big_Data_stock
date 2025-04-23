echo "root password"
echo "123" | passwd --stdin root
sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
systemctl reload sshd

cat >>/etc/hosts<<EOF
192.168.56.10 master.xtl
192.168.56.20 worker1.xtl
192.168.56.30 worker2.xtl
EOF

echo "export TERM=xterm-256color" >> ~/.bashrc
source ~/.bashrc