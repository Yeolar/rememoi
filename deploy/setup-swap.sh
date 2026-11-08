#!/bin/sh
# Add a 2G swapfile to a 4G Debian/Ubuntu host and tune reclaim.
#
# Swap is not a memory upgrade: it only turns "the whole box freezes" into "one
# cgroup gets killed and restarted". Keep container memory limits as the primary
# defence, this as the safety net.
#
# Idempotent: re-running reuses an already active swapfile.
#
#   sudo sh deploy/setup-swap.sh
set -eu

[ "$(id -u)" -eq 0 ] || {
  echo "must run as root: sudo sh $0" >&2
  exit 1
}

SWAPFILE=/swapfile
SIZE_MB=2048

if swapon --show=NAME --noheadings 2>/dev/null | grep -qx "$SWAPFILE"; then
  echo "[swap] $SWAPFILE already active"
else
  if [ ! -f "$SWAPFILE" ]; then
    echo "[swap] allocating ${SIZE_MB}MB at $SWAPFILE"
    # fallocate is instant but unsupported on some filesystems; fall back to dd.
    fallocate -l "${SIZE_MB}M" "$SWAPFILE" ||
      dd if=/dev/zero of="$SWAPFILE" bs=1M count="$SIZE_MB" status=none
    chmod 600 "$SWAPFILE"
    mkswap "$SWAPFILE" >/dev/null
  fi
  swapon "$SWAPFILE"
fi

grep -q "^$SWAPFILE " /etc/fstab ||
  echo "$SWAPFILE none swap sw 0 0" >>/etc/fstab

# swappiness 10: prefer dropping the dentry/inode cache over paging out live
# processes; vfs_cache_pressure 50: give that cache a fair chance to stay.
cat >/etc/sysctl.d/99-swap.conf <<'EOF'
vm.swappiness = 10
vm.vfs_cache_pressure = 50
EOF
sysctl -q --system

echo
swapon --show
free -h
